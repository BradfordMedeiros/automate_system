
const start = require('./init/startSystem');
const mapSystemToApiLayer = require('./mapSystemToApiLayer');
const migrateDatabase = require('./environment/migrate').createDb;

const init = ({
  resourceFile,
  mqtt = { mqttPort: 1883, httpPort: 4000 },
  httpBridge = { enabled: false },
  onEvent,
  onTopic,
  api = { },
  verbose,
} = {}) => {
  console.log('mqtt ', mqtt.mqttPort);

  if (typeof(resourceFile) !== typeof('')){
    throw (new Error("Resource file string must be defined"));
  }
  if (typeof(mqtt) !== typeof({})){
    throw new Error('Mqtt parameters must be defined');
  }
  if (typeof(mqtt.mqttPort) !== typeof(1)){
    throw new Error('mqtt mqttPort must be defined');
  }
  if (mqtt.useInternalBroker){
    if (typeof(mqtt.useInternalBroker) !== typeof(true)){
      throw (new Error('use internal broker must be a boolean value'));
    }
  }else{
    if (typeof(mqtt.httpPort) !== typeof(1)){
      throw (new Error('mqtt httpPort must be defined if using internal broker (default behavior)'))
    }
  }
  if (httpBridge){
    if (typeof(httpBridge.enabled) !== typeof(true)){
      throw (new Error('http bridge enable must be boolean value'));
    }
    if (httpBridge.enabled){
      if (!Number.isInteger(httpBridge.port)){
        throw (new Error('http bridge: port must be defined (positive integer value'));
      }
    }
  }
  if ((onEvent !== undefined) && (typeof(onEvent) !== 'function')){
    throw (new Error("onEvent must be defined as a function if defined"))
  }
  if ((onTopic !== undefined) && (typeof(onTopic) !== 'function')){
    throw (new Error("onTopic must be defined as a function if defined"))
  }

  if ((api !== undefined) && (typeof(api) !== typeof({}))){
    throw (new Error("api must be defined as a object if defined"))
  }

  return new Promise((resolve, reject) => {
    start({
      resourceFile,
      mqtt,
      httpBridge,
      onEvent,
      onTopic,
      api,
      verbose,
    }).then(system => {
      resolve(mapSystemToApiLayer(system, false));
    }).catch(reject);
  });
};

const automate_sys = {
  init,
  migrateDatabase,
};

module.exports = automate_sys;
