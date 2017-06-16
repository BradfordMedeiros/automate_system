const createRule = require('./createRule');

let conditionGetter = () => {
  throw (new Error("Get conditions never set: Were rules loaded?"));
};

let getConditions = () => conditionGetter();

let rules = { };

const getRulesFromDb = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all('SELECT * FROM rules_engine', (err, actions) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve(actions);
      }
    });
  });
});

const saveRuleToDb = (db, ruleName, conditionName, strategy, rate) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    const query = `INSERT OR REPLACE INTO rules_engine (name, conditionName, strategy, rate) values ('${ruleName}', '${conditionName}', '${strategy}', ${rate})`;
    database.run(query, (err) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});

const addRule = (db, ruleName, conditionName, strategy, rate) => {
  const ruleEval = createRule(conditionName, [], strategy, rate);
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
  db.open().catch(reject).then(database => {
    database.run(`DELETE FROM rules_engine WHERE name = ('${ruleName}')`, (err) => {
      database.close();
      rules[ruleName].stop();
      delete rules[ruleName];
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});

const loadRules = (db, getConditionsFunc) => new Promise((resolve, reject) => {
  getConditions = getConditionsFunc;
  getRulesFromDb(db).catch(reject).then(rules => {
    rules.forEach(rule => {
      addRule(db, rule.name, rule.conditionName, rule.strategy, rule.rate);
    });
    resolve();
  });
});

const getRules = () => Object.keys(rules).map(rule => rules[rule]);

module.exports = {
  addRule,
  deleteRule,
  getRules,
  loadRules,
};
