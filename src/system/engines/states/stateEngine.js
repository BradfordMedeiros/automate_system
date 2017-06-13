
let stateScripts = { };

const getStateScriptsFromDb = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all('SELECT * FROM state_engine', (err, actions) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve(actions);
      }
    });
  });
});

const saveStateScriptToDb = (db, stateScriptName, topic, eval) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    const query = `INSERT OR REPLACE INTO state_engine (name, topic, eval) values ('${stateScriptName}', '${topic}','${eval}')`;
    database.all(query, (err) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});


const transformStateScriptToString = (conditionString) => {
  const evalString = `({ getStates }) => {
    ${conditionString}
  }`;
  return eval(evalString);
};


const addStateScript = (db,  stateScriptName, topic, eval ) => {
  let handle = undefined;

  const evalFunction = () => transformStateScriptToString(eval)({  });
  stateScripts[stateScriptName] = {
    name: stateScriptName,
    topic,
    eval: evalFunction,
    run: publish => {
      if (typeof(publish) !== 'function'){
        throw (new Error('Publish must be function'));
      }
      handle = setInterval(() => {
        const value = evalFunction();
        publish(topic, value.toString());
      }, 1000);
    },
    stop: () => clearInterval(handle),
  };
  saveStateScriptToDb(db, stateScriptName, topic, eval);
};

const deleteStateScript = (db, stateScriptName) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(`DELETE FROM state_engine WHERE name = ('${stateScriptName}')`, (err) => {
      database.close();
      stateScripts[stateScriptName].stop();
      delete stateScripts[stateScriptName];
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});

const loadStateScripts = (db) => new Promise((resolve, reject) => {
  getStateScriptsFromDb(db).catch(reject).then(stateScripts => {
    stateScripts.forEach(stateScriptData => {
      addStateScript(db,stateScriptData.name, stateScriptData.eval);
    });
    resolve();
  });
});

const getStateScripts = () => Object.keys(stateScripts).map(script => stateScripts[script]);

module.exports = {
  addStateScript,
  deleteStateScript,
  getStateScripts,
  loadStateScripts,
};
