
let schedules = { };

const getSchedulesFromDb = db => new Promise((resolve, reject) => {
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

const saveScheduleToDb = (db, name, topic, schedule) => new Promise((resolve, reject) => {
  db.open().then(database => {
    const query = `INSERT OR REPLACE INTO scheduler_engine (name, topic, schedule) values ('${name}', '${topic}','${schedule}')`;
    database.all(query, (err) => {
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});


const addSchedule = (db,  scheduleName, topic, schedule) => {
  /*let handle = undefined;

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
  };*/
  saveScheduleToDb(db, scheduleName, topic, schedule);
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

const loadStateScripts = (db) => new Promise((resolve, reject) => {
  getStateScriptsFromDb(db).then(loadedStateScripts => {
    loadedStateScripts.forEach(stateScriptData => {
      addStateScript(db,stateScriptData.name, stateScriptData.eval);
    });
    resolve();
  }).catch(reject);
});

const getSchedules = () => schedules;

module.exports = {
  addSchedule,
};
