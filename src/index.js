const process = require('process');
const migrate = require('./environment/migrate');
const loadSystem = require('./loadSystem');
const getDatabase = require('./getDatabase');
const startMqttBroker = require('./environment/startMqttBroker');
const mqttSystem = require('./mqttSystem');

process.on("unhandledRejection", function (err) {
  console.error("unhandledRejection: " + err.stack); // or whatever.
});

const migrateSystem = resourceFile => {
  return new Promise((resolve, reject) => {
    if (!migrate.isMigrated(resourceFile)){
      console.log('Migration: Not yet migrated');
      migrate.createDb(resourceFile).then(() => {
        console.log("Migration: Successful")
        resolve();
      }).catch(err => {
        console.log("Migration: Failure");
        reject(err);
      });
    }else{
      console.log('Migration: Already migrated');
      resolve();
    }
  });
};

const printStartMessage = ({ resourceFile, startMqtt, mqttPort }) => {
  console.log('Starting automate core')
  console.log('Resource: ', resourceFile);
  console.log('Using internal Mqtt Broker: ', startMqtt);
  console.log('Mqtt Port: ', mqttPort);
};

const start = ({ resourceFile, startMqtt }) => {
  printStartMessage({resourceFile, startMqtt });
  migrateSystem(resourceFile).then(() => {
    loadSystem(getDatabase(resourceFile)).then(system => {
      console.log('System: Loaded system');
      const theSystem = system;
      sys = theSystem;
      if (startMqtt){
        startMqttBroker().then(() => {
          console.log('System: started mqtt broker');
          mqttSystem({
            onState: (topic, messsage) => {
              theSystem.baseSystem.states.onStateData(topic, messsage);
            },
            onAction: (topic, message) => {
              theSystem.baseSystem.actions.onActionData(topic, message);
            },
            onEvent: (topic, message) => {
              console.log('got event: ', topic, ' message: ', message);
              theSystem.baseSystem.events.onEventData(topic, message);
            }
          }).catch(() => console.log('could not connect to mqtt'));
        }).catch(err => {
          console.log('System: Could not start mqtt broker');
        })
      }
    }).catch(() => {
      console.log('System: Could not load system')
    })
  }).catch(err => {
    console.log(err);
  });
};

const init = ({
  resourceFile,
  startMqtt = false,
}) => {
  if (typeof(resourceFile) !== typeof('')){
    throw (new Error("Resource file string must be defined"));
  }

  start({
    resourceFile,
    startMqtt: startMqtt,
  })
};

const automate_sys = {
  init,
};

module.exports = automate_sys;
