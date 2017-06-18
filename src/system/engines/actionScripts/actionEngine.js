const path = require('path');

let actionScripts = { };

const getActionScriptsFromDb = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all('SELECT * FROM action_engine', (err, actions) => {
      if (err){
        reject(err);
      }else{
        resolve(actions);
      }
    });
  }).catch(reject);
});

const saveActionScriptToDb = (db, actionScriptName, topic, script) => new Promise((resolve, reject) => {
  db.open().then(database => {
    const query = (
      `INSERT OR REPLACE INTO 
         action_engine 
       (name, topic, script) 
         values 
       ('${actionScriptName}', '${topic}','${script}')`);

    database.all(query, (err) => {
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});


const transformActionScriptToString = (conditionString) => {
  const evalString = `({ getStates }) => {
    ${conditionString}
  }`;
  return eval(evalString);
};


const addActionScript = (db,  actionScriptName, topic, script ) => {
  const evalFunction = () => transformActionScriptToString(script)({  });
  actionScripts[actionScriptName] = {
    name: actionScriptName,
    topic,
    getValue: evalFunction
  };
  saveActionScriptToDb(db, actionScriptName, topic, script);
};

const deleteStateScript = (db, stateScriptName) => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(`DELETE FROM state_engine WHERE name = ('${stateScriptName}')`, (err) => {
      //database.close();
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

const loadActionScripts = (db) => new Promise((resolve, reject) => {
  getActionScriptsFromDb(db).then(loadedActionScripts => {
    loadedActionScripts.forEach(actionScriptData => {
      addActionScript(db, actionScriptData.name, actionScriptData.topic, actionScriptData.script);
    });
    resolve();
  }).catch(reject);
});

const getActionScripts = () => actionScripts;

const onMqttTopic = (topic, message) => {
  return Object.keys(actionScripts)
    .filter(actionScript => path.join('/actions',actionScripts[actionScript].topic) === topic)
    .map(actionScript => actionScripts[actionScript])
    .map(script => ({
        topic: script.topic,
        value: script.getValue(),
    }));
};

module.exports = {
  //addStateScript,
  //deleteStateScript,
  getActionScripts,
  loadActionScripts,
  addActionScript,
  onMqttTopic,
};
