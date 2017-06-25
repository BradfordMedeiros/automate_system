
let stateScripts = { };

let mqttClientGetter = () => {
  throw (new Error("getMqttClient never set: Was state engine loaded?"));
};

let getMqttClient = () => mqttClientGetter();

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


const transformStateScriptToString = (conditionString) => {
  const evalString = `({ getStates }) => {
    ${conditionString}
  }`;
  return eval(evalString);
};


const addStateScript = (db,  stateScriptName, topic, eval ) => {
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

  const evalFunction = () => transformStateScriptToString(eval)({  });
  stateScripts[stateScriptName] = {
    name: stateScriptName,
    topic,
    eval: evalFunction,
    run: () => {
      handle = setInterval(() => {
        const value = evalFunction();
        mqttClientGetter().publish(topic, value === undefined ? '' : value.toString());
      }, 1000);
    },
    stop: () => clearInterval(handle),
  };
  stateScripts[stateScriptName].run();
  saveStateScriptToDb(db, stateScriptName, topic, eval);
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

const loadStateScripts = (db, getMqttClient) => new Promise((resolve, reject) => {
  mqttClientGetter = getMqttClient;
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
