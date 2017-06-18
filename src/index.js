const process = require('process');
const path = require('path');
const migrate = require('./environment/migrate');
const loadSystem = require('./loadSystem');
const getDatabase = require('./getDatabase');
const startMqttBroker = require('./environment/startMqttBroker');
const mqttSystem = require('./mqttSystem');

/*process.on("unhandledRejection", function (err) {
  console.error("unhandledRejection: " + err.stack); // or whatever.
});*/

const handleError = err => {
  console.error('Error: ', err);
  if (err){
    console.error(err.stack);
  }
}

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

const printStartMessage = ({ resourceFile, mqttPort }) => {
  console.log('Starting automate core')
  console.log('Resource: ', resourceFile);
  console.log('Mqtt Port: ', mqttPort);
};

const start = ({ resourceFile }) => {
  printStartMessage({resourceFile});
  migrateSystem(resourceFile).then(() => {
    loadSystem(getDatabase(resourceFile)).then(system => {
      console.log('System: Loaded system');
      const theSystem = system;
      sys = theSystem;
      startMqttBroker().then(mqttClient => {
        console.log('System: started mqtt broker');
        mqttSystem({
          onState: (topic, messsage) => {
            theSystem.baseSystem.states.onStateData(topic, messsage).catch(handleError);
          },
          onAction: (topic, message, client) => {
            theSystem.baseSystem.actions.onActionData(topic, message).catch(handleError);
            const data = theSystem.engines.actionScriptEngine.onMqttTopic(topic, message);
            data.forEach(item => {
              console.log('to topic: ', item.toTopic);
              console.log('message: ', item.value);
              client.publish(item.toTopic, item.value.toString(), (err) => {
                console.log(err);
              });
            })
          },
          onSequence: (topic, message) => {
            // match the sequence and call execute
            const sequenceName = topic.split('/').filter(x => x.length > 0).slice(1).join('/');
            const matchingSequence = theSystem.engines.sequenceEngine.getSequences()[sequenceName];
            if (matchingSequence) {
              console.log('found a match');
              matchingSequence.run();
            } else {
              console.log('no match for ', topic);
            }
          },
          onEvent: (topic, message) => {
            theSystem.logging.events.onEventData(topic, message).catch(handleError);
          },
          onHistory: (topic, message) => {
            theSystem.logging.history.onHistoryData(topic, message).catch(handleError);
          },
        }).catch(() => console.log('could not connect to mqtt'));
      }).catch(err => {
        console.log('System: Could not start mqtt broker');
      })

    }).catch((err) => {
      console.log(err.stack)
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
