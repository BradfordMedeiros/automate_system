
let conditions = { };

let stateGetter = () => {
  throw (new Error("Get states never set: Were conditions loaded?"));
};

let getStates = () => stateGetter();

const getConditionsFromDb = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all('SELECT * FROM conditions', (err, actions) => {
      //database.close();
      if (err){
        reject(err);
      }else{
        resolve(actions);
      }
    });
  }).catch(reject);
});

const saveConditionToDb = (db, conditionName, eval) => new Promise((resolve, reject) => {
  db.open().then(database => {
    const query = `INSERT OR REPLACE INTO conditions (name, eval) values ('${conditionName}', '${eval}')`;
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

const transformConditionString = (conditionString) => {
  const evalString = `({ getStates }) => {
    ${conditionString}
  }`;
  return eval(evalString);
};

const addCondition = (db,  conditionName, eval, extraArg) => {
  if (typeof(conditionName) !== typeof('')){
    throw (new Error('baseSystem:conditions:addCondition conditionName must be a string'));
  }
  if (typeof(eval) !== typeof('')){
    throw (new Error('baseSystem:conditions:addCondition eval must be a string'));
  }

  return new Promise((resolve, reject) => {
    conditions[conditionName] = {
      name: conditionName,
      eval: () => transformConditionString(eval)({ getStates }),
    };
    saveConditionToDb(db, conditionName, eval).then(resolve).catch(reject);
  });
};

const deleteCondition = (db, conditionName) => new Promise((resolve, reject) => {
  if (typeof(conditionName) !== typeof('')){
    throw (new Error('baseSystem:conditions:deleteCondition conditionName must be a string'));
  }

  db.open().then(database => {
    database.all(`DELETE FROM conditions WHERE name = ('${conditionName}')`, (err) => {
      delete conditions[conditionName];
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const loadConditions = (db, getSystemStates) => new Promise((resolve, reject) => {
  stateGetter =  getSystemStates;
  getConditionsFromDb(db).then(conditions => {
    conditions.forEach(condition => {
      addCondition(db, condition.name, condition.eval);
    });
    resolve();
  }).catch(reject);
});

const getConditions = () => conditions;

module.exports = {
  addCondition,
  deleteCondition,
  getConditions,
  loadConditions,
};
