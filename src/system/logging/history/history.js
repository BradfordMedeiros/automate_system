

const mqttDataCache = { };
const getMqttValue = topic => {
  return mqttDataCache[topic];
};

const validateGetHistoryParameters = options => {
  if (options !== undefined){
    if (options.topic && typeof(options.topic) !== typeof('')){
      throw (new Error('logging:history:getHistory topic is not defined as string'));
    }
    if (options.limit && typeof(options.limit) !== typeof(1)){
      throw (new Error('logging:history:getHistory limit is not defined as number'));
      if (limit < 1){
        throw (new Error('logging:history:getHistory limit must be at least 1'));
      }
    }
  }
};

const getHistory = (db, options) => {
  validateGetHistoryParameters(options);

  let query = `SELECT * FROM history`;

  if (options){
    const limit = options.limit;
    const topic = options.topic;

    if (topic !== undefined){
      query = `${query} where topic='${topic}'`
    }
    if (limit !== undefined){
      query = `${query} limit ${limit}`
    }
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
