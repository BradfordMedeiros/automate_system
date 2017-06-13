let states = { };

const getStatesFromDb = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all('SELECT * FROM states', (err, states) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve(states);
      }
    });
  });
});

const saveStateToDb = (db, topic, value) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(`INSERT OR REPLACE INTO states (topic, value) values ('${topic}','${value}')`, (err) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
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
  db.open().catch(reject).then(database => {
    database.all(`DELETE FROM states WHERE topic = ('${topic}')`, (err) => {
      database.close();
      states = { };
      loadStates(db);
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});

const onStateData = (db, topic, value) => new Promise((resolve, reject) => {
  addStateData(topic, value);
  saveStateToDb(db, topic, value).then(resolve).catch(reject);
});

const loadStates= db => new Promise((resolve, reject) => {
  getStatesFromDb(db).catch(reject).then(states => {
    states.forEach(state => {
      addStateData(state.topic, state.value)
    });
    resolve();
  });
});

const getStates = () => Object.keys(states).map(state => states[state]);

module.exports = {
  getStates,
  onStateData,
  loadStates,
  unregisterState,
};
