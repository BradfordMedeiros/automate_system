
let conditions = { };

const getConditionsFromDb = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all('SELECT * FROM conditions', (err, actions) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve(actions);
      }
    });
  });
});

const saveConditionToDb = (db, conditionName, eval) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    const query = `INSERT OR REPLACE INTO conditions (name, eval) values ('${conditionName}', '${eval}')`;
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



const addCondition = (db,  conditionName, eval ) => {
  conditions[conditionName] = eval;
  saveConditionToDb(db, conditionName, eval);
};

// @todo
const deleteCondition = (db, conditionName) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(`DELETE FROM conditions WHERE name = ('${conditionName}')`, (err) => {
      database.close();
      conditions = { };
      loadConditions(db);
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});

const loadConditions = db => new Promise((resolve, reject) => {
  getConditionsFromDb(db).catch(reject).then(conditions => {
    conditions.forEach(condition => {
      addCondition(db, condition.name, condition.eval);
    });
    resolve();
  });
});

const getConditions = () => conditions;

module.exports = {
  addCondition,
  deleteCondition,
  getConditions,
  loadConditions,
};
