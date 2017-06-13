const loadBaseSystem = require('./system/base/loadBaseSystem');
const loadEngines = require('./system/engines/loadEngines');

const loadSystem = db => {
  const loadBaseSystemPromise = loadBaseSystem(db);
  const loadEnginesPromise = loadEngines(db);

  const EnginesLoaded = Promise.all([loadBaseSystemPromise, loadEnginesPromise]);

  return new Promise((resolve, reject) => {
    const system = { };
    EnginesLoaded.catch(reject).then(() => {
      loadBaseSystemPromise.then(baseSystem => {
        system.baseSystem = baseSystem;
        loadEnginesPromise.then(engines => {
          system.engines = engines;
          resolve(system);
        });
      })
    });
  });
};

module.exports = loadSystem;
