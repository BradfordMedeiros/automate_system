
const createRule = (conditionName, conditions, strategy, rate) => {
  return {
    run: () => {
      console.log('rule: run');
    },
    stop: () => {
      console.log('rule: stop');
    },
  }
};

module.exports = createRule;