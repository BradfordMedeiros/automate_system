const process = require('process');
const path = require('path');
const migrate = require('./environment/migrate');
const loadSystem = require('./system/loadSystem');
const getDatabase = require('./getDatabase');
const startMqttBroker = require('./environment/startMqttBroker');
const mqttSystem = require('./mqttSystem');

process.on("unhandledRejection", function (err) {
  console.error("unhandledRejection: " + err.stack); // or whatever.
});

const handleError = err => {
  console.error('Error: ', err);
  if (err){
    console.error(err.stack);
  }
}

const migrateSystem = (resourceFile, verbose) => {
  return new Promise((resolve, reject) => {
    if (!migrate.isMigrated(resourceFile)){
      if (verbose){
        console.log('Migration: Not yet migrated');
      }
      migrate.createDb(resourceFile).then(() => {
        if (verbose){
          console.log("Migration: Successful");
        }
        resolve();
      }).catch(err => {
        if (verbose){
          console.log("Migration: Failure");
        }
        reject(err);
      });
    }else{
      if (verbose){
        console.log('Migration: Success - Already migrated');
      }
      resolve();
    }
  });
};


const printStartMessage = ({ resourceFile, mqtt, httpBridge, verbose }) => {
  if (verbose){
    console.log('Starting automate core')
    console.log('Resource: ', resourceFile);
    console.log('Mqtt Port: ', mqtt.mqttPort);
    console.log('Mqtt http Port: ', mqtt.httpPort);
    console.log('Http bridge enabled: ', httpBridge.enabled);
    console.log('http bridge port: ', httpBridge.port);
  }
};

const start = ({ resourceFile, mqtt, httpBridge, verbose }) => {
  return new Promise((resolver, rejector) => {
    printStartMessage({resourceFile, mqtt, httpBridge, verbose });
    migrateSystem(resourceFile).then(() => {
      loadSystem(getDatabase(resourceFile)).then(system => {
        const theSystem = system;
        startMqttBroker({ mqttPort: mqtt.mqttPort, httpPort: mqtt.httpPort }).then(mqttClient => {
          mqttSystem({
            onState: (topic, messsage) => {
              theSystem.baseSystem.states.onStateData(topic, messsage).catch(handleError);
            },
            onAction: (topic, message, client) => {
              theSystem.baseSystem.actions.onActionData(topic, message).catch(handleError);
              const data = theSystem.engines.actionScriptEngine.onMqttTopic(topic, message);
              data.forEach(item => {
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
          }, {
            mqttPort: mqtt.mqttPort,
          }).then(mqttClient => {
            theSystem.engines.schedulerEngine.startAll(mqttClient);
            if (httpBridge.enabled === true){
              theSystem.bridges.httpBridge.start(
                mqttClient.publish.bind(mqttClient),
                theSystem.logging.history.getMqttValue.bind(theSystem.logging.history),
                { httpBridgePort: httpBridge.port }
              );
            }
            resolver(theSystem);
          }).catch(() => rejector('could not connect to mqtt'));
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
  });

};

module.exports = start;
