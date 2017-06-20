const scheduler = require('node-schedule');

let schedules = { };

const getSchedulesFromDb = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all('SELECT * FROM scheduler_engine', (err, actions) => {
      if (err){
        reject(err);
      }else{
        resolve(actions);
      }
    });
  }).catch(reject);
});

const saveScheduleToDb = (db, name, topic, schedule, value) => new Promise((resolve, reject) => {
  db.open().then(database => {
    const query = `
    INSERT OR REPLACE 
      INTO 
    scheduler_engine 
      (name, schedule, topic, value) 
    values 
      ('${name}', '${schedule}', '${topic}', '${value}')`;
    database.all(query, (err) => {
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});


const addSchedule = (db,  scheduleName, schedule, topic, value) => {
  let handle;
  schedules[scheduleName] = {
    name: scheduleName,
    topic,
    value,
    start: publish => {
      if (publish === undefined){
        throw (new Error('publish must be massed into start'));
      }

      if (handle){
        throw (new Error('Schedule: '+scheduleName+ ' already started'));
      }else{
        handle = scheduler.scheduleJob(schedule, () => {
          publish(topic, value)
        })
      }
    },
    stop: () => {
      if (handle){
        handle.cancel();
      }
    }
  };
  saveScheduleToDb(db, scheduleName, schedule, topic, value);
};

const deleteSchedule = (db, scheduleName) => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(`DELETE FROM scheduler_engine WHERE name = ('${scheduleName}')`, (err) => {
      delete schedules[scheduleName];
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const loadSchedules = (db) => new Promise((resolve, reject) => {
  getSchedulesFromDb(db).then(loadedSchedules => {
    loadedSchedules.forEach(schedule => {
      addSchedule(db,  schedule.schedule, schedule.name, schedule.topic);
    });
    resolve();
  }).catch(reject);
});

const getSchedules = () => schedules;

module.exports = {
  addSchedule,
  deleteSchedule,
  getSchedules,
  loadSchedules,
};
