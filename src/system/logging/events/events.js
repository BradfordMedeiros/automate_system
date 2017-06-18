
const getEvents = db => {
  return new Promise((resolve, reject) => {
    db.open().then(database => {
      database.all(`SELECT * FROM events`, (err, values) => {
        if (err) {
          reject(err);
        } else {
          resolve(values);
        }
      });
    }).catch(reject);
  });
};

const saveEventToDb = (db, topic, value) => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(`INSERT INTO events (topic, value) values ('${topic}', '${value}')`, (err) => {
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const onEventData = (db, topic, value) => new Promise((resolve, reject) => {
  return saveEventToDb(db, topic, value).then(resolve).catch(reject);
});

module.exports = {
  onEventData,
  getEvents,
};
