let states = { };

const getStatesFromDb = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all('SELECT * FROM states', (err, states) => {
      if (err){
        reject(err);
      }else{
        resolve(states);
      }
    });
  }).catch(reject);
});

const saveStateToDb = (db, topic, value) => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(`INSERT OR REPLACE INTO states (topic, value) values ('${topic}','${value}')`, (err) => {
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const addStateData = (topic, value) => {
  if (states[topic]){
    states[topic].value = value;
  }else{
    states[topic] = {
      topic,
      value,
    };
  }
};

const unregisterState = (db, topic) => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(`DELETE FROM states WHERE topic = ('${topic}')`, (err) => {
      delete states[topic];
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const onStateData = (db, topic, value) => new Promise((resolve, reject) => {
  addStateData(topic, value);
  saveStateToDb(db, topic, value).then(resolve).catch(reject);
});

const loadStates= db => new Promise((resolve, reject) => {
  getStatesFromDb(db).then(states => {
    states.forEach(state => {
      addStateData(state.topic, state.value)
    });
    resolve();
  }).catch(reject);
});

const getStates = () => states;

module.exports = {
  getStates,
  onStateData,
  loadStates,
  unregisterState,
};
