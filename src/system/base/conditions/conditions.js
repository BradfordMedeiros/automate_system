
let conditions = { };

let api = { };
let getApi = () => api;

const getConditionsFromDb = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all('SELECT * FROM conditions', (err, actions) => {
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
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const transformConditionString = (conditionString, api) => {
  const evalString = `({ ${Object.keys(api).join(', ')} }) => {
    ${conditionString}
  }`;
  return eval(evalString);
};

const addCondition = (db,  conditionName, eval) => {
  if (typeof(conditionName) !== typeof('')){
    throw (new Error('baseSystem:conditions:addCondition conditionName must be a string'));
  }
  if (typeof(eval) !== typeof('')){
    throw (new Error('baseSystem:conditions:addCondition eval must be a string'));
  }

  const api = getApi();

  return new Promise((resolve, reject) => {
    const conditionPayloadFunction = transformConditionString(eval, api);
    conditions[conditionName] = {
      name: conditionName,
      evalString: eval,
      eval: () => conditionPayloadFunction(api),
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

const loadConditions = (db, getApi) => new Promise((resolve, reject) => {
  api =  getApi;
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
