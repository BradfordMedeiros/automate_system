const CronJob = require('cron').CronJob;

const isValidSchedule = schedule => {
  let isValid = true;
  try {
    new CronJob(schedule, () => { });
  } catch(ex) {
    isValid = false;
  }
  return isValid;
};

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

const saveScheduleToDb = (db, name,  schedule, topic, value) => new Promise((resolve, reject) => {
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
  if (!isValidSchedule(schedule)){
    throw (new Error('Invalid pattern for schedule '+ scheduleName+ ' got pattern: '+ schedule));
  }

  let job;
  schedules[scheduleName] = {
    name: scheduleName,
    topic,
    value,
    schedule,
    start: publish => {
      if (publish === undefined){
        throw (new Error('publish must be massed into start'));
      }

      if (job){
        throw (new Error('Schedule: '+scheduleName+ ' already started'));
      }else{
        job = new CronJob(schedule, () => {
          publish(topic, value);
        });
        job.start();
      }
    },
    stop: () => {
      if (job){
        job.stop();
      }
    }
  };
  saveScheduleToDb(db, scheduleName, schedule, topic, value);
};

const deleteSchedule = (db, scheduleName) => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(`DELETE FROM scheduler_engine WHERE name = ('${scheduleName}')`, (err) => {
      schedules[scheduleName].stop();
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
      addSchedule(db, schedule.name, schedule.schedule, schedule.topic, schedule.value);
    });
    resolve();
  }).catch(reject);
});

const startAll = mqttClient => {
  Object.keys(schedules).forEach(schedule => {
    schedules[schedule].start(mqttClient.publish.bind(mqttClient));
  });
};

const stopAll = () => {
  Object.keys(schedules).forEach(schedule => {
    schedules[schedule].stop();
  });
};

const getSchedules = () => schedules;

module.exports = {
  startAll,
  stopAll,
  addSchedule,
  deleteSchedule,
  getSchedules,
  loadSchedules,
  isValidSchedule,
};
