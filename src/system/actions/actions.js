
let actions = { };


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
    const query = `INSERT OR REPLACE INTO actions (topic, value) values ('${topic}', '${value}')`;
    console.log(query);
    database.all(query, (err) => {
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

const unregisterAction = (db, topic) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(`DELETE FROM actions WHERE topic = ('${topic}')`, (err) => {
      database.close();
      actions = { };
      loadActions(db);
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});

const loadActions = db => new Promise((resolve, reject) => {
  getActionsFromDb(db).catch(reject).then(actions => {
    actions.forEach(action => {
      addActionData(action.topic, action.value)
    });
    resolve();
  });
});

const getActions = () => Object.keys(actions).map(action => actions[action]);

module.exports = {
  getActions,
  onActionData,
  loadActions,
  unregisterAction,
};
