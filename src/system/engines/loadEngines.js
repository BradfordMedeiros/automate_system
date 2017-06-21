const stateScriptEngine = require('./stateScripts/stateEngine');
const actionScriptEngine = require('./actionScripts/actionEngine');
const sequenceEngine = require('./sequence/sequenceEngine');
const ruleEngine = require('./rules/ruleEngine');
const schedulerEngine = require('./scheduler/schedulerEngine');

const loadEngines = (db, getActions, getConditions, getMqttClient) => {
  const loadStateScriptEngine = stateScriptEngine.loadStateScripts(db);
  const loadActionEngine = actionScriptEngine.loadActionScripts(db);
  const loadSequenceEngine = sequenceEngine.loadSequences(db, getActions);
  const loadRuleEngine = ruleEngine.loadRules(db, getConditions);
  const loadScheduleEngine = schedulerEngine.loadSchedules(db, getMqttClient);

  const enginesLoaded = Promise.all([loadStateScriptEngine, loadActionEngine, loadSequenceEngine, loadRuleEngine, loadScheduleEngine]);

  return new Promise((resolve, reject) => {
    enginesLoaded.then(() => {
      const engines = {
        stateScriptEngine: {
          addStateScript: (name, topic, eval) => stateScriptEngine.addStateScript(db, name, topic, eval),
          deleteStateScript: (name) => stateScriptEngine.deleteStateScript(db, name),
          getStateScripts: stateScriptEngine.getStateScripts,
        },
        actionScriptEngine: {
          addActionScript: (actionScriptName, topic, script, toTopic) => actionScriptEngine.addActionScript(db, actionScriptName, topic, script, toTopic),
          deleteActionScript: (actionScriptName) => actionScriptEngine.deleteActionScript(db, actionScriptName),
          getActionScripts: actionScriptEngine.getActionScripts,
          onMqttTopic: actionScriptEngine.onMqttTopic,
        },
        sequenceEngine: {
          addSequence: (sequenceName, sequenceParts) => sequenceEngine.addSequence(db, sequenceName, sequenceParts),
          deleteSequence: (sequenceName) => sequenceEngine.deleteSequence(db, sequenceName),
          getSequences: sequenceEngine.getSequences,
        },
        ruleEngine: {
          addRule: (ruleName, conditionName, strategy, rate, topic, value) => ruleEngine.addRule(db, ruleName, conditionName, strategy, rate, topic, value),
          deleteRule: (ruleName) => ruleEngine.deleteRule(db, ruleName),
          getRules: ruleEngine.getRules,
        },
        schedulerEngine: {
          addSchedule: (scheduleName, schedule, topic, value) => schedulerEngine.addSchedule(db, scheduleName, schedule, topic, value),
          deleteSchedule: (scheduleName) => schedulerEngine.deleteSchedule(db, scheduleName),
          getSchedules: schedulerEngine.getSchedules,
          isValidSchedule: schedulerEngine.isValidSchedule,
          startAll: schedulerEngine.startAll,
          stopAll: schedulerEngine.stopAll,
        }
      };
      resolve(engines);
    }).catch(reject);
  });
};

module.exports = loadEngines;
