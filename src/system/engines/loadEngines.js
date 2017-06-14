const stateEngine = require('./states/stateEngine');
const sequenceEngine = require('./sequence/sequenceEngine');

const loadEngines = db => {
  const loadStateEngine = stateEngine.loadStateScripts(db);
  const loadSequenceEngine = sequenceEngine.loadSequences(db);

  const enginesLoaded = Promise.all([loadStateEngine, loadSequenceEngine]);

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
        }
      };
      resolve(engines);
    });
  });
};

module.exports = loadEngines;
