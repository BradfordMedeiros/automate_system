const CronJob = require('cron').CronJob;

let mqttClientGetter = () => {
  throw (new Error("getMqttClient never set: Was schedule engine loaded?"));
};

let getMqttClient = () => mqttClientGetter();

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
  if (typeof(scheduleName) !== typeof('')){
    throw (new Error('engines:scheduler:addSchedule scheduleName must be a string'));
  }
  if (typeof(scheduleName) !== typeof('') || !isValidSchedule(schedule) ){
    throw (new Error('engines:scheduler:addSchedule schedule must be a valid schedule (string)'));
  }
  if (typeof(topic) !== typeof('')){
    throw (new Error('engines:scheduler:addSchedule topic must be a string'));
  }
  if (typeof(value) !== typeof('')){
    throw (new Error('engines:scheduler:addSchedule value must be a string'));
  }

  if (schedules[scheduleName] !== undefined){
    throw (new Error(`engines:scheduler:addSchedule schedule ${scheduleName} already exists`));
  }

  let job;
  schedules[scheduleName] = {
    name: scheduleName,
    topic,
    value,
    schedule,
    start: () => {
      if (job){
        throw (new Error('Schedule: '+scheduleName+ ' already started'));
      }else{
        job = new CronJob(schedule, () => {
          mqttClientGetter().publish(topic, value);
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
  schedules[scheduleName].start();
  return saveScheduleToDb(db, scheduleName, schedule, topic, value);
};

const deleteSchedule = (db, scheduleName) => new Promise((resolve, reject) => {
  if (typeof(scheduleName) !== typeof('')){
    throw (new Error('engines:scheduler:deleteSchedule scheduleName must be a string'));
  }

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

const loadSchedules = (db, getMqttClient) => new Promise((resolve, reject) => {
  mqttClientGetter =  getMqttClient;

  getSchedulesFromDb(db).then(loadedSchedules => {
    loadedSchedules.forEach(schedule => {
      addSchedule(db, schedule.name, schedule.schedule, schedule.topic, schedule.value);
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
