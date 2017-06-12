
const process = require('process');
const path = require('path');
const mqtt_mongo = require('mqtt_mongo');
const fs_mount_mqtt = require('fs_mount_mqtt');

const startMqttBroker = require('./src/environment/startMqttBroker');

const virtual_system = require('./src/system/virtual_system');

const PORT = 9000;
const MONGO_PORT = 6302;

const MQTT_MONGO_CONFIG = {
  MONGO_URL : `mongodb://localhost:${MONGO_PORT}/myproject`,
  MQTT_URL : 'http://127.0.0.1:1883'
};

const FS_MOUNT_CONFIG = {
  MQTT_URL : 'http://127.0.0.1:1883',
  SYNC_FOLDER_PATH: './mock',
};

const startMqttBrokerPromise = startMqttBroker();
startMqttBrokerPromise.then(() => {
  console.log('MQTT Broker Started');
}).catch(() => {
  console.error('Error: Could not start MQTT Started');
});



Promise.all([  startMqttBrokerPromise]).then(() => {
  console.log('Environment Started');
  fs_mount_mqtt.syncMqttToFileSystem(FS_MOUNT_CONFIG);


  virtual_system.load_virtual_system(path.resolve('./mock')).then(() => {
    mqtt_mongo.logMqttToMongo(MQTT_MONGO_CONFIG).then(({mongoDb, client}) => {
      console.log('MongoDb client connected');


    }).catch(err => {
      console.log('Could not connect Mongo or MQTT client');
      console.error(err);
      process.exit(1);
    });
  }).catch(err => {
    console.log('Could not load virtual system');
    process.exit(1);  // might not be great for prod but definitely good for dev
  });

}).catch((err) => {
  console.error('oh no');
  process.exit(1);
});

