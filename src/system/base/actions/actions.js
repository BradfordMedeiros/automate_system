
let actions = { };


const getActionsFromDb = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all('SELECT * FROM actions', (err, actions) => {
      if (err){
        reject(err);
      }else{
        resolve(actions);
      }
    });
  }).catch(reject);
});

const saveActionToDb = (db, topic, value) => new Promise((resolve, reject) => {
  db.open().then(database => {
    const query = `INSERT OR REPLACE INTO actions (topic, value) values ('${topic}', '${value}')`;
    console.log(query);
    database.all(query, (err) => {
      //database.close();
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
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
  db.open().then(database => {
    database.all(`DELETE FROM actions WHERE topic = ('${topic}')`, (err) => {
      //database.close();
      delete actions[topic];
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const loadActions = db => new Promise((resolve, reject) => {
  getActionsFromDb(db).then(actions => {
    actions.forEach(action => {
      addActionData(action.topic, action.value)
    });
    resolve();
  }).catch(reject);
});

const getActions = () => actions;

module.exports = {
  getActions,
  onActionData,
  loadActions,
  unregisterAction,
};
