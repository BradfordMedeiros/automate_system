const createRule = require('./createRule');

let conditionGetter = () => {
  throw (new Error("Get conditions never set: Were rules loaded?"));
};

let getConditions = () => conditionGetter();

let rules = { };

const getRulesFromDb = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all('SELECT * FROM rules_engine', (err, rules) => {
      //database.close();
      if (err){
        reject(err);
      }else{
        resolve(rules);
      }
    });
  }).catch(reject);
});

const saveRuleToDb = (db, ruleName, conditionName, strategy, rate) => new Promise((resolve, reject) => {
  db.open().then(database => {
    const query = `INSERT OR REPLACE INTO rules_engine (name, conditionName, strategy, rate) values ('${ruleName}', '${conditionName}', '${strategy}', ${rate})`;
    database.run(query, (err) => {
      //database.close();
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const addRule = (db, ruleName, conditionName, strategy, rate) => {
  const ruleEval = createRule(conditionName, getConditions, strategy, rate);
  rules[ruleName] = {
    name: ruleName,
    conditionName,
    strategy,
    rate,
    run: ruleEval.run,
    stop: ruleEval.stop,
  };
  return saveRuleToDb(db, ruleName, conditionName, strategy, rate);
};

const deleteRule = (db, ruleName) => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.run(`DELETE FROM rules_engine WHERE name = ('${ruleName}')`, (err) => {
      // database.close();
      rules[ruleName].stop();
      delete rules[ruleName];
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const loadRules = (db, getConditionsFunc) => new Promise((resolve, reject) => {
  getConditions = getConditionsFunc;
  getRulesFromDb(db).then(loadedRules => {
    loadedRules.forEach(rule => {
      addRule(db, rule.name, rule.conditionName, rule.strategy, rule.rate);
    });
    resolve();
  }).catch(reject);
});

const getRules = () => rules;

module.exports = {
  addRule,
  deleteRule,
  getRules,
  loadRules,
};
