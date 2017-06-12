
const getEvents = db => {
  return new Promise((resolve, reject) => {
    db.open().catch(reject).then(database => {
      database.all(`SELECT * FROM events`, (err, values) => {
        database.close();
        if (err) {
          reject(err);
        } else {
          resolve(values);
        }
      });
    });
  });
};

const saveEventToDb = (db, topic, value) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(`INSERT INTO events (topic, value) values ('${topic}', '${value}')`, (err) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});

const onEventData = (db, topic, value) => new Promise((resolve, reject) => {
  return saveEventToDb(db, topic, value);
});

module.exports = {
  onEventData,
  getEvents,
};
