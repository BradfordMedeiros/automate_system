

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

const getHistory = (db, options = { }) => {
  const limit = options.limit;
  const topic = options.topic;

  let query = `SELECT * FROM history`;

  if (topic !== undefined){
    query = `${query} where topic='${topic}'`
  }
  if (limit !== undefined){
    if (limit < 1){
      throw (new Error('Limit must be at least 1'));
    }
    query = `${query} limit ${limit}`
  }


  return new Promise((resolve, reject) => {
    db.open().then(database => {
      database.all(query, (err, values) => {
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
