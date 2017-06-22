const path = require('path');
const fs = require('fs');
const createClient = require('./createClient');
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

describe('automate_system start', () => {
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

  it('creates a resource file in path specified', () => {
      const resourceFileExists = fs.existsSync(resourceFilePath);
      if (!resourceFileExists){
        throw (new Error('Resource file does not exist '+resourceFilePath));
      }
  });
  it ('actions are saved', () => (
     new Promise((resolve, reject) => {
      client.publish('/actions/humidity/', 'hello');
      setTimeout(() => {
        const action = automate.baseSystem.actions.getActions()['/actions/humidity/'];
        if (action === undefined){
          reject('/action/humidity/ was not defined');
        }else{
          resolve();
        }
      }, 30);
    })
  ));
  it ('states are saved', () => (
    new Promise((resolve, reject) => {
      client.publish('/actions/humidity/', 'hello');
      setTimeout(() => {
        const action = automate.baseSystem.actions.getActions()['/actions/humidity/'];
        if (action === undefined){
          reject('/action/humidity/ was not defined');
        }else{
          resolve();
        }
      }, 30);
    })
  ))
});


