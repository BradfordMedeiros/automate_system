
const rules = require('when_do').rules;

const strategyMapping = {
  'positive-edge': (eval, rate) =>  rules.transitionToTrue(eval, undefined, rate),
  'negative-edge': (eval, rate) => rules.transitionToFalse(eval, undefined, rate),
  'each': (eval, rate) => rules.each(eval, undefined, rate),
};


const createRule = (conditionName, getConditions, strategy, rate, topic, value, getMqttClient) => {
  const condition = getConditions()[conditionName];
  if (condition === undefined){
    throw (new Error('engines:ruleEngine:addRule condition:  '+ conditionName+ ' is not an condition, so cannot make a rule'));
  }
  if (Object.keys(strategyMapping).indexOf(strategy) < 0){
    throw (new Error('engines:ruleEngine:addRule strategy: '+strategy+ ' is not a valid strategy'));
  }

  const getEvaluator = strategyMapping[strategy];

  let handle;
  return {
    run: () => {
      if (!handle){
        handle = getEvaluator(condition.eval, rate).do(() => {
          getMqttClient().publish(topic, value);
        });
      }else{
        handle.resume();
      }
    },
    stop: () => {
      if (handle){
        handle.pause();
      }
    },
  }
};

module.exports = createRule;