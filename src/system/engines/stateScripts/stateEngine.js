
let stateScripts = { };

let mqttClientGetter = () => {
  throw (new Error("getMqttClient never set: Was state engine loaded?"));
};

let apiGetter = () => {
  throw (new Error("api never set: was state engine loaded?"));
};

let getMqttClient = () => mqttClientGetter();
let getApi = () => apiGetter();

const getStateScriptsFromDb = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all('SELECT * FROM state_engine', (err, actions) => {
      if (err){
        reject(err);
      }else{
        resolve(actions);
      }
    });
  }).catch(reject);
});

const saveStateScriptToDb = (db, stateScriptName, topic, eval) => new Promise((resolve, reject) => {
  db.open().then(database => {
    const query = `INSERT OR REPLACE INTO state_engine (name, topic, eval) values ('${stateScriptName}', '${topic}','${eval}')`;
    database.all(query, (err) => {
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});


const transformStateScriptToString = (conditionString, api) => {
  const evalString = `({ ${Object.keys(api).join(', ')} }) => {
    ${conditionString}
  }`;
  return eval(evalString);
};


const addStateScript = (db,  stateScriptName, topic, eval) => {
  if (typeof(stateScriptName) !== typeof('')){
    throw (new Error('engines:stateScript:addStateScript stateScriptName must be a string'));
  }
  if (typeof(topic) !== typeof('')){
    throw (new Error('engines:stateScript:addStateScript topic must be a string'));
  }
  if (typeof(eval) !== typeof('')){
    throw (new Error('engines:stateScript:addStateScript eval must be a string'));
  }
  if (stateScripts[stateScriptName] !== undefined){
    throw (new Error(`engines:stateEngine:addStateScript stateScript ${stateScriptName} already exists`));
  }

  let handle = undefined;

  const api = getApi();
  const evalFunc =  transformStateScriptToString(eval, api);
  const evalFunction = () => evalFunc(api);
  stateScripts[stateScriptName] = {
    name: stateScriptName,
    topic,
    evalString: eval,
    eval: evalFunction,
    run: () => {
      if (handle){
        return;
      }
      handle = setInterval(() => {
        const value = evalFunction();
        mqttClientGetter().publish(topic, value === undefined ? '' : value.toString());
      }, 1000);
    },
    stop: () => {
      clearInterval(handle);
      handle = undefined;
    }
  };

  return new Promise((resolve, reject) => {
    stateScripts[stateScriptName].run();
    saveStateScriptToDb(db, stateScriptName, topic, eval).then(resolve).catch(reject);
  });

};

const deleteStateScript = (db, stateScriptName) => new Promise((resolve, reject) => {
  if (typeof(stateScriptName) !== typeof('')){
    throw (new Error('engines:stateScript:deleteStateScript stateScriptName must be a string'));
  }
  db.open().then(database => {
    database.all(`DELETE FROM state_engine WHERE name = ('${stateScriptName}')`, (err) => {
      stateScripts[stateScriptName].stop();
      delete stateScripts[stateScriptName];
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const loadStateScripts = (db, getMqttClient, api) => new Promise((resolve, reject) => {
  mqttClientGetter = getMqttClient;
  apiGetter = () => api;
  getStateScriptsFromDb(db).then(loadedStateScripts => {
    loadedStateScripts.forEach(stateScriptData => {
      addStateScript(db, stateScriptData.name, stateScriptData.topic, stateScriptData.eval);
    });
    resolve();
  }).catch(reject);
});

const getStateScripts = () => stateScripts;

module.exports = {
  addStateScript,
  deleteStateScript,
  getStateScripts,
  loadStateScripts,
};
