const stateEngine = require('./states/stateEngine');

const loadEngines = db => {
  const loadStateEngine = stateEngine.loadStateScripts(db);

  const enginesLoaded = Promise.all([loadStateEngine]);

  return new Promise((resolve, reject) => {
    enginesLoaded.catch(reject).then(() => {
      const engines = {
        stateEngine: {
          addStateScript: (name, topic, eval) => stateEngine.addStateScript(db, name, topic, eval),
          deleteStateScript: (name) => stateEngine.deleteStateScript(db, name),
          getStateScripts: stateEngine.getStateScripts,
        }
      };
      resolve(engines);
    });
  });
};

module.exports = loadEngines;
