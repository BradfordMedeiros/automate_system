

const mqttDataCache = { };
const getMqttValue = topic => {
  return mqttDataCache[topic];
};


/*
  @todo options:
  {
    topic: <topic to query>, // no topic doesn't query
    limit: <number of items to query>,
  }
 */

const getHistory = db => {
  return new Promise((resolve, reject) => {
    db.open().then(database => {
      database.all(`SELECT * FROM history`, (err, values) => {
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
    database.run(`INSERT INTO history (topic, value) values ('${topic}', '${value}')`, (err) => {
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const onHistoryData = (db, topic, value) => new Promise((resolve, reject) => {
  mqttDataCache[topic] = value;
  return saveHistoryToDb(db, topic, value).then(resolve).catch(reject);
});

module.exports = {
  onHistoryData,
  getHistory,
  getMqttValue,
};
