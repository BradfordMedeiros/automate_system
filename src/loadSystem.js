const loadBaseSystem = require('./system/base/loadBaseSystem');
const loadEngines = require('./system/engines/loadEngines');

const loadSystem = db => {
  const loadBaseSystemPromise = loadBaseSystem(db);
  const loadEnginesPromise = loadEngines(db, () => []);


  return new Promise((resolve, reject) => {
    const system = { };
    loadBaseSystemPromise.catch(reject).then(baseSystem => {
      system.baseSystem = baseSystem;
      loadEngines(db, system.baseSystem.actions.getActions).catch(reject).then(engines => {
        system.engines = engines;
        resolve(system);
      });
    });
  });
};

module.exports = loadSystem;
