const process = require('process');
const path = require('path');
const printStartMessage = require('./steps/printStartMessage');
const migrateSystem = require('./steps/migrateSystem');
const loadSystem = require('../system/loadSystem');
const getDatabase = require('../getDatabase');
const startMqttBroker = require('../environment/startMqttBroker');
const mqttSystem = require('./steps/mqttSystem');
const startHttpBridge = require('./steps/startHttpBridge');
const createSystemHooks = require('./hooks/createSystemHooks');
const handleMqttMessage =  require('./hooks/handleMqttMessage');

process.on("unhandledRejection", function (err) {
  console.error("unhandledRejection: " + err.stack); // or whatever.
});

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
const initializeSystem = (resourceFile, mqtt,  httpBridge) => new Promise((resolve, reject) => {
  startMqttBroker({mqttPort: mqtt.mqttPort, httpPort: mqtt.httpPort}).then(server => {
    setup.server = server;
    mqttSystem({mqttPort: mqtt.mqttPort}).then(mqttClient => {
      setup.mqttClient = mqttClient;
      const databasePromise = getDatabase(resourceFile);
      loadSystem(databasePromise, () => mqttClient).then(theSystem => {
        setup.databasePromise = databasePromise;
        mqttClient.on('message', handleMqttMessage(mqttClient, createSystemHooks(theSystem)));
        if (httpBridge.enabled === true) {
          startHttpBridge(theSystem, mqttClient, httpBridge.port).then(httpServer => {
            setup.httpServer = httpServer;
            resolve(injectStop(theSystem, setup));
          }).catch(reject);
        } else {
          resolve(inject(theSystem, setup))
        }
      }).catch(reject);
    }).catch(reject);
  }).catch(reject);
});

const start = ({ resourceFile, mqtt, httpBridge, verbose }) => new Promise((resolve, reject) => {
  printStartMessage({resourceFile, mqtt, httpBridge, verbose});
  migrateSystem(resourceFile).then(
    () => {
      initializeSystem(resourceFile, mqtt, httpBridge).then(sys => resolve(sys)).catch(reject);
    }
  ).catch(reject);
});


module.exports = start;
