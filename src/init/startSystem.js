const printStartMessage = require('./steps/printStartMessage');
const migrateSystem = require('./steps/migrateSystem');
const loadSystem = require('../system/loadSystem');
const getDatabase = require('../getDatabase');
const startMqttBroker = require('../environment/startMqttBroker');
const mqttSystem = require('./steps/mqttSystem');
const startHttpBridge = require('./steps/startHttpBridge');
const createSystemHooks = require('./hooks/createSystemHooks');
const handleMqttMessage =  require('./hooks/handleMqttMessage');


const injectStop = (system, setup) => {
  system.stop = () => {
    setup.httpServer.close();
    setup.server.close();
    setup.mqttClient.end();
    setup.databasePromise.close();
  };
  return system;
};

const setup = { };
const initializeSystem = (resourceFile, mqtt,  httpBridge, onEvent, onTopic) => new Promise((resolve, reject) => {
  startMqttBroker({mqttPort: mqtt.mqttPort, httpPort: mqtt.httpPort, useInternalBroker: mqtt.useInternalBroker }).then(server => {
    setup.server = server;
    mqttSystem({ mqttPort: mqtt.mqttPort }).then(mqttClient => {
      setup.mqttClient = mqttClient;
      const databasePromise = getDatabase(resourceFile);
      loadSystem(databasePromise, () => mqttClient).then(theSystem => {
        setup.databasePromise = databasePromise;
        mqttClient.on('message', handleMqttMessage(mqttClient, createSystemHooks(theSystem, onEvent, onTopic)));
        if (httpBridge.enabled === true) {
          startHttpBridge(theSystem, mqttClient, httpBridge.port).then(httpServer => {
            setup.httpServer = httpServer;
            resolve(injectStop(theSystem, setup));
          }).catch(reject);
        } else {
          setup.httpServer = { close: () => {} }
          resolve(injectStop(theSystem, setup))
        }
      }).catch(reject);
    }).catch(reject);
  }).catch(reject);
});

const start = ({ resourceFile, mqtt, httpBridge, onEvent, onTopic, verbose }) => new Promise((resolve, reject) => {
  printStartMessage({resourceFile, mqtt, httpBridge, verbose});
  migrateSystem(resourceFile).then(
    () => {
      initializeSystem(resourceFile, mqtt, httpBridge, onEvent, onTopic).then(sys => resolve(sys)).catch(reject);
    }
  ).catch(reject);
});


module.exports = start;
