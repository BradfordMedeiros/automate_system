const loadBaseSystem = require('./system/base/loadBaseSystem');
const loadEngines = require('./system/engines/loadEngines');
const loadLogging = require('./system/logging/loadLogging');

const loadSystem = db => {
  const loadBaseSystemPromise = loadBaseSystem(db);
  const loadLoggingPromise = loadLogging(db);
  const loadSystemPromise = Promise.all([loadBaseSystemPromise, loadLoggingPromise]);

  return new Promise((resolve, reject) => {
    const system = {};
    loadSystemPromise.catch(reject).then(() => {
      loadLoggingPromise.catch(reject).then(logging => {
        system.logging = logging;
      });
      loadBaseSystemPromise.catch(reject).then(baseSystem => {
        system.baseSystem = baseSystem;
        loadEngines(db, system.baseSystem.actions.getActions).catch(reject).then(engines => {
          system.engines = engines;
          resolve(system);
        });
      });
    });
  });
};

module.exports = loadSystem;


/*


 */
