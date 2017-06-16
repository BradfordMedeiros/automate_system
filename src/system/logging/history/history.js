
const getHistory = db => {
  return new Promise((resolve, reject) => {
    db.open().then(database => {
      database.all(`SELECT * FROM history`, (err, values) => {
        //database.close();
        if (err) {
          reject(err);
        } else {
          resolve(values);
        }
      });
    }).catch(reject);
  });
};

const saveHistoryToDb = (db, topic, value) => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(`INSERT INTO history (topic, value) values ('${topic}', '${value}')`, (err) => {
      //database.close();
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const onHistoryData = (db, topic, value) => new Promise((resolve, reject) => {
  return saveHistoryToDb(db, topic, value).then(reject).catch(reject);
});

module.exports = {
  onHistoryData,
  getHistory,
};
