const path = require('path');

let actionScripts = { };
let apiGetter = () => {
  throw (new Error("api never set: was state engine loaded?"));
};
let getApi = () => apiGetter();

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

const saveActionScriptToDb = (db, actionScriptName, topic, script, toTopic) => new Promise((resolve, reject) => {
  db.open().then(database => {
    const query = (
      `INSERT OR REPLACE INTO 
         action_engine 
       (name, topic, script, toTopic) 
         values 
       ('${actionScriptName}', '${topic}','${script}', '${toTopic}')`
    );

    database.all(query, (err) => {
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});


const transformActionScriptToString = (conditionString, api) => {
  const evalString = `({ ${Object.keys(api).join(', ')} }) => {
    ${conditionString}
  }`;
  return eval(evalString);
};


const addActionScript = (db,  actionScriptName, topic, script, toTopic ) => {
  if (typeof(actionScriptName) !== typeof('')){
    throw (new Error('engines:actionScript:addActionScript actionScriptName must be a string'));
  }
  if (typeof(topic) !== typeof('')){
    throw (new Error('engines:actionScript:addActionScript topic must be a string'));
  }
  if (typeof(script) !== typeof('')){
    throw (new Error('engines:actionScript:addActionScript script must be a string'));
  }
  if (typeof(toTopic) !== typeof('')){
    throw (new Error('engines:actionScript:addActionScript toTopic must be a string'));
  }

  if (actionScripts[actionScriptName] !== undefined){
    throw (new Error(`engines:actionScript:addActionScript actionScript ${actionScriptName} already exists`));
  }

  const api = getApi();
  const evalFunction = transformActionScriptToString(script, api);
  actionScripts[actionScriptName] = {
    name: actionScriptName,
    topic,
    toTopic,
    script,
    getValue: () => evalFunction(api),
  };
  return saveActionScriptToDb(db, actionScriptName, topic, script, toTopic);
};

const deleteActionScript = (db, actionScriptName) => new Promise((resolve, reject) => {
  if (typeof(actionScriptName) !== typeof('')){
    throw (new Error('engines:actionScript:deleteActionScript actionScriptName must be a string'));
  }

  db.open().then(database => {
    database.all(`DELETE FROM action_engine WHERE name = ('${actionScriptName}')`, (err) => {
      delete actionScripts[actionScriptName];
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const loadActionScripts = (db, api) => new Promise((resolve, reject) => {
  getApi = () => api;
  getActionScriptsFromDb(db).then(loadedActionScripts => {
    loadedActionScripts.forEach(actionScriptData => {
      addActionScript(db, actionScriptData.name, actionScriptData.topic, actionScriptData.script, actionScriptData.toTopic);
    });
    resolve();
  }).catch(reject);
});

const getActionScripts = () => actionScripts;

const onMqttTopic = (topic, message) => {
  return Object.keys(actionScripts)
    .filter(actionScript => actionScripts[actionScript].topic === topic)
    .map(actionScript => actionScripts[actionScript])
    .map(script => ({
        toTopic: script.toTopic,
        value: script.getValue(),
    }));
};

module.exports = {
  deleteActionScript,
  getActionScripts,
  loadActionScripts,
  addActionScript,
  onMqttTopic,
};
