
const rules = require('when_do').rules;

const strategyMapping = {
  'positive-edge': (eval, rate) => {
    console.log('creating transition to true: rate: ' ,rate);
    console.log('eval is ', eval);
    console.log('initial value: ', eval());
    return rules.transitionToTrue(eval, undefined, rate)
  },
  'negative-edge': (eval, rate) => rules.transitionToFalse(eval, undefined, rate),
  'each': (eval, rate) => rules.each(eval, undefined, rate),
};


const createRule = (conditionName, getConditions, strategy, rate) => {

  console.log('creating rule: ');
  console.log('conditionName: ', conditionName);
  console.log('strategy: ', strategy);
  console.log('rate: ', rate);

  const condition = getConditions()[conditionName];
  if (condition === undefined){
    throw (new Error('Condition:  ', conditionName, ' is not an condition, so cannot make a rule'));
  }

  if (Object.keys(strategyMapping).indexOf(strategy) < 0){
    throw (new Error('strategy: ',strategy, ' is not a valid strategy'));
  }

  const getEvaluator = strategyMapping[strategy];
  r = getEvaluator;
  c = condition;
  ra = rate;

  let handle;
  return {
    run: () => {
      if (!handle){
        handle = getEvaluator(condition.eval, rate).do(() => {
          console.log('need to add a hook for something');
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