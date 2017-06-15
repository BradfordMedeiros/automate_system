
const getHistory = db => {
  return new Promise((resolve, reject) => {
    db.open().catch(reject).then(database => {
      database.all(`SELECT * FROM history`, (err, values) => {
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

const saveHistoryToDb = (db, topic, value) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(`INSERT INTO history (topic, value) values ('${topic}', '${value}')`, (err) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});

const onHistoryData = (db, topic, value) => new Promise((resolve, reject) => {
  return saveHistoryToDb(db, topic, value);
});

module.exports = {
  onHistoryData,
  getHistory,
};
