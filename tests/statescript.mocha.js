const path = require('path');
const fs = require('fs');
const createClient = require('./util/createClient');
const automate_system = require('../src/index');

const resourceFilePath = path.join(__dirname, 'temp/somefile.db');

const options = {
  resourceFile: resourceFilePath,
  mqtt: {
    mqttPort: 1882,
    httpPort: 4000,
  },
  httpBridge: {
    enabled: true,
    port: 1657,
  },
};

describe('state script', () => {
  let automate;
  let client;

  beforeEach(() => {
    const clientPromise = createClient({ mqttPort: 1882 }, {});
    clientPromise.then(mqttClient => {
      client = mqttClient;
    });

    return new Promise((resolve, reject) => {
      automate_system.init(options).then(system => {
        const resourceExists = fs.existsSync(resourceFilePath);
        if (resourceExists){
          automate = system;
          clientPromise.then(() => {
            resolve([automate, client]);
          }).catch(reject);
        }else{
          reject(resourceFilePath + ' does not exist');
        }
      }).catch(reject);
    })
  });
  afterEach(() => {
    automate.stop();
    client.end();
  });

  it ('state scripts are saved', () => (
    new Promise((resolve, reject) => {
      client.subscribe('/states/humidity/', 'hello');
      client.on('message', (topic, message) => {
        console.log('got: ',  topic, ' message: ', message.toString());
        if (topic === '/states/humidity'){
          automate.engines.stateScriptEngine.getStateScripts()['test script'].stop();
          resolve();
        }
      });
      automate.engines.stateScriptEngine.addStateScript(
        'test script',
        '/states/humidity',
        'return Math.random() * 80'
      );
    })
  ))
});


