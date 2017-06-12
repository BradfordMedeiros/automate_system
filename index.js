const process = require('process');
const migrate = require('./src/migrate');
const loadSystem = require('./src/loadSystem');
const getDatabase = require('./src/getDatabase');

process.on("unhandledRejection", function (err) {
  console.error("unhandledRejection: " + err.stack); // or whatever.
});

const printStartMessage = ({ resourceFile, startMqtt, mqttPort }) => {
  console.log('Starting automate core')
  console.log('Resource: ', resourceFile);
  console.log('Using internal Mqtt Broker: ', startMqtt);
  console.log('Mqtt Port: ', mqttPort);

  if (!migrate.isMigrated(resourceFile)){
    console.log('Migration: Not yet migrated');
    migrate.createDb(resourceFile).then(() => {
      console.log("Migration: Successful")
    }).catch(err => {
      console.log("Migration: Failure");
    });
  }else{
    console.log('Migration: Already migrated');
  }
};

const start = ({ resourceFile, startMqtt, mqttPort }) => {
  printStartMessage({ resourceFile, startMqtt, mqttPort });

  console.log('System: loading system');
  loadSystem(getDatabase(resourceFile)).then(system => {
    console.log('System: Loaded system');
    sys = system;
  }).catch(() => {
    console.log('System: Could not load system')
  })
};


const init = ({
  resourceFile,
  startMqtt = false,
  mqttPort,
}) => {
  if (typeof(resourceFile) !== typeof('')){
    throw (new Error("Resource file string must be defined"));
  }
  if (typeof(mqttPort) !== typeof(1)){
    throw (new Error('Port of MQTT Server must be defined'));
  }

  start({
    resourceFile,
    startMqtt: startMqtt,
    mqttPort,
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