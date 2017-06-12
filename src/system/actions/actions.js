const actions = { };

const getActionsFromDb = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all('SELECT * FROM actions', (err, actions) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve(actions);
      }
    });
  });
});

const saveActionToDb = (db, topic, value) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(`INSERT OR REPLACE INTO actions (topic) values ('${topic}')`, (err) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});

const addActionData = (topic, value) => {
  // log to mqtt database
  if (actions[topic]){
    actions[topic].value = value;
  }else{
    actions[topic] = {
      topic,
      value,
    };
  }
};

const onActionData = (db, topic, value) => new Promise((resolve, reject) => {
  addActionData(topic, value);
  saveActionToDb(db, topic, value).then(resolve).catch(reject);
});

const loadActions = db => new Promise((resolve, reject) => {
  getActionsFromDb(db).catch(reject).then(actions => {
    actions.forEach(action => addActionData(action.topic, action.value))
    resolve();
  });
});

const getActions = () => Object.keys(actions).map(action => actions[action]);

module.exports = {
  getActions,
  onActionData,
  loadActions,
};
