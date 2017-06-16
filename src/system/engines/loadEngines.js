const stateEngine = require('./states/stateEngine');
const sequenceEngine = require('./sequence/sequenceEngine');
const ruleEngine = require('./rules/ruleEngine');

const loadEngines = (db, getActions, getConditions) => {
  const loadStateEngine = stateEngine.loadStateScripts(db);
  const loadSequenceEngine = sequenceEngine.loadSequences(db, getActions);
  const loadRuleEngine = ruleEngine.loadRules(db, getConditions);

  const enginesLoaded = Promise.all([loadStateEngine, loadSequenceEngine, loadRuleEngine]);

  return new Promise((resolve, reject) => {
    enginesLoaded.catch(reject).then(() => {
      const engines = {
        stateEngine: {
          addStateScript: (name, topic, eval) => stateEngine.addStateScript(db, name, topic, eval),
          deleteStateScript: (name) => stateEngine.deleteStateScript(db, name),
          getStateScripts: stateEngine.getStateScripts,
        },
        sequenceEngine: {
          addSequence: (sequenceName, sequenceParts) => sequenceEngine.addSequence(db, sequenceName, sequenceParts),
          deleteSequence: (sequenceName) => sequenceEngine.deleteSequence(db, sequenceName),
          getSequences: sequenceEngine.getSequences,
        },
        ruleEngine: {
          addRule: (ruleName, conditionName, strategy, rate) => ruleEngine.addRule(db, ruleName, conditionName, strategy, rate),
          deleteRule: (ruleName) => ruleEngine.deleteRule(db, ruleName),
          getRules: ruleEngine.getRules,
        }
      };
      resolve(engines);
    });
  });
};

module.exports = loadEngines;
