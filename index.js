const process = require('process');
const migrate = require('./src/migrate');
const loadSystem = require('./src/loadSystem');
const getDatabase = require('./src/getDatabase');
const startMqttBroker = require('./src/environment/startMqttBroker');
const mqttSystem = require('./src/mqttSystem');

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
              theSystem.states.onStateData(topic, messsage);
            },
            onAction: (topic, message) => {
              theSystem.actions.onActionData(topic, message);
            },
            onEvent: (topic, message) => {
              console.log('got event: ', topic, ' message: ', message);
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

/*

  system:
    actions: [    - data: (topic)
       path: <no make sense>
       get_name: <name of action? --> should be topic name?>
       get_type: --> doesn't really make sense anymore,

       proposed:
       get_value: get current value of the action
    ],
    states: [
      path: <no  make sense>
      get_state: <get value might make more sense>
      get_name: <topic name make more sense>
      scripts: {    // joined?
        contnet: // ?
      }
    ],
    conditions: [
    ],
    sequences: [

    ]


 */