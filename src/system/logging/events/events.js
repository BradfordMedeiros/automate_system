
const validateGetEventsParameters = options => {
  if (options !== undefined){
    if (options.limit && typeof(options.limit) !== typeof(1)){
      throw (new Error('logging:events:getEvents limit is not defined as number'));
      if (limit < 1){
        throw (new Error('logging:events:getEvents limit must be at least 1'));
      }
    }
  }
};


const getEvents = (db, options) => {
  validateGetEventsParameters(options);

  let query = `SELECT * FROM events`;
  if (options){
    const limit = options.limit;
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

