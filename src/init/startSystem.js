const process = require('process');
const path = require('path');
const printStartMessage = require('./steps/printStartMessage');
const migrateSystem = require('./steps/migrateSystem');
const loadSystem = require('../system/loadSystem');
const getDatabase = require('../getDatabase');
const startMqttBroker = require('../environment/startMqttBroker');
const mqttSystem = require('./steps/mqttSystem');
const createSystemHooks = require('./steps/createSystemHooks');
const startHttpBridge = require('./steps/startHttpBridge');

process.on("unhandledRejection", function (err) {
  console.error("unhandledRejection: " + err.stack); // or whatever.
});

const initializeSystem = (resourceFile, mqtt,  httpBridge) => new Promise((resolve, reject) => {
  loadSystem(getDatabase(resourceFile)).then(theSystem => {
    startMqttBroker({mqttPort: mqtt.mqttPort, httpPort: mqtt.httpPort}).then(() => {
      mqttSystem(createSystemHooks(theSystem), {mqttPort: mqtt.mqttPort}).then(mqttClient => {
        theSystem.engines.schedulerEngine.startAll(mqttClient);
        if (httpBridge.enabled === true) {
          startHttpBridge(theSystem, mqttClient, httpBridge.port).then(() => {
            resolve(theSystem);
          }).catch(reject);
        }else{
          resolve(theSystem)
        }
      }).catch(reject);
    }).catch(reject);
  }).catch(reject);
});


const start = ({ resourceFile, mqtt, httpBridge, verbose }) => new Promise((resolve, reject) => {
  printStartMessage({resourceFile, mqtt, httpBridge, verbose});
  migrateSystem(resourceFile).then(
    () => {
      console.log('finished migration-------------');
      initializeSystem(resourceFile, mqtt, httpBridge).then(sys => resolve(sys)).catch(reject);
    }
  ).catch(reject);
});


module.exports = start;
