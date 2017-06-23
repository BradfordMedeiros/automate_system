const createRule = require('./createRule');

let conditionGetter = () => {
  throw (new Error("Get conditions never set: Was rule engine loaded?"));
};
let getConditions = () => conditionGetter();

let mqttClientGetter = () => {
  throw (new Error("getMqttClient never set: Was rule engine loaded?"));
};
let getMqttClient = () => mqttClientGetter();


let rules = { };

const getRulesFromDb = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all('SELECT * FROM rules_engine', (err, rules) => {
      if (err){
        reject(err);
      }else{
        resolve(rules);
      }
    });
  }).catch(reject);
});

const saveRuleToDb = (db, ruleName, conditionName, strategy, rate, topic, value) => new Promise((resolve, reject) => {
  db.open().then(database => {
    const query = `
    INSERT OR REPLACE INTO 
      rules_engine 
    (name, conditionName, strategy, rate, topic, value) 
      values 
    ('${ruleName}', '${conditionName}', '${strategy}', ${rate}, '${topic}', '${value}')`;
    database.run(query, (err) => {
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const addRule = (db, ruleName, conditionName, strategy, rate, topic, value) => {
  if (typeof(ruleName) !== typeof('')){
    throw (new Error('engines:ruleEngine:addRule ruleName must be a string'));
  }
  if (typeof(conditionName) !== typeof('')){
    throw (new Error('engines:ruleEngine:addRule conditionName must be a string'));
  }
  if (typeof(strategy) !== typeof('')){
    throw (new Error('engines:ruleEngine:addRule strategy must be a string'));
  }
  if (typeof(rate) !== typeof(1) || rate <= 0){
    throw (new Error('engines:ruleEngine:addRule rate must be a number greater than 0'));
  }
  if (typeof(topic) !== typeof('')){
    throw (new Error('engines:ruleEngine:addRule topic must be a string'));
  }
  if (typeof(value) !== typeof('')){
    throw (new Error('engines:ruleEngine:addRule value must be a string'));
  }

  const ruleEval = createRule(conditionName, getConditions, strategy, rate, topic, value, getMqttClient);
  rules[ruleName] = {
    name: ruleName,
    conditionName,
    strategy,
    rate,
    run: ruleEval.run,
    stop: ruleEval.stop,
  };
  rules[ruleName].run();
  return saveRuleToDb(db, ruleName, conditionName, strategy, rate, topic, value);
};

const deleteRule = (db, ruleName) => new Promise((resolve, reject) => {
  if (typeof(ruleName) !== typeof('')){
    throw (new Error('engines:ruleEngine:deleteRule ruleName must be a string'));
  }

  db.open().then(database => {
    database.run(`DELETE FROM rules_engine WHERE name = ('${ruleName}')`, (err) => {
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

const loadRules = (db, getConditionsFunc, getMqttClient) => new Promise((resolve, reject) => {
  getConditions = getConditionsFunc;
  mqttClientGetter =  getMqttClient;
  getRulesFromDb(db).then(loadedRules => {
    loadedRules.forEach(rule => {
      addRule(db, rule.name, rule.conditionName, rule.strategy, rule.rate, rule.topic, rule.value);
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
