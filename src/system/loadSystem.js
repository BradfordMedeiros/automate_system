const loadBaseSystem = require('./base/loadBaseSystem');
const loadEngines = require('./engines/loadEngines');
const loadLogging = require('./logging/loadLogging');
const loadBridges = require('./bridges/loadBridges');
const loadMisc = require('./misc/loadMisc');

const loadSystem = (db, getMqttClient, api) => {

  const bridges = loadBridges();
  const loadBaseSystemPromise = loadBaseSystem(db, api);
  const loadLoggingPromise = loadLogging(db);
  const loadMiscPromise = loadMisc(db);
  const loadSystemPromise = Promise.all([loadBaseSystemPromise, loadLoggingPromise, loadMiscPromise]);

  return new Promise((resolve, reject) => {
    const system = {};
    system.bridges = bridges;
    loadSystemPromise.then(() => {
      loadLoggingPromise.then(logging => {
        system.logging = logging;
      }).catch(reject);
      loadMiscPromise.then(misc => {
        system.env = misc.env;
      }).catch(reject);

      loadBaseSystemPromise.then(baseSystem => {
        system.baseSystem = baseSystem;
        loadEngines(
          db,
          system.baseSystem.actions.getActions,
          system.baseSystem.conditions.getConditions,
          getMqttClient
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
