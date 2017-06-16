const loadBaseSystem = require('./system/base/loadBaseSystem');
const loadEngines = require('./system/engines/loadEngines');
const loadLogging = require('./system/logging/loadLogging');

const loadSystem = db => {
  const loadBaseSystemPromise = loadBaseSystem(db);
  const loadLoggingPromise = loadLogging(db);
  const loadSystemPromise = Promise.all([loadBaseSystemPromise, loadLoggingPromise]);

  return new Promise((resolve, reject) => {
    const system = {};
    loadSystemPromise.then(() => {
      loadLoggingPromise.then(logging => {
        system.logging = logging;
      }).catch(reject);
      loadBaseSystemPromise.then(baseSystem => {
        system.baseSystem = baseSystem;
        loadEngines(
          db,
          system.baseSystem.actions.getActions,
          system.baseSystem.conditions.getConditions
        ).then(engines => {
          system.engines = engines;
          resolve(system);
        }).catch(reject);
      }).catch(reject);
    }).catch(reject);
  });
};

module.exports = loadSystem;


/*


 */
