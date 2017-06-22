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

describe('history', () => {
  let automate;
  let client;

  beforeEach(() => {
    fs.unlinkSync(resourceFilePath);

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

  it ('get history gets all topics', () => (
    new Promise((resolve, reject) => {
      client.publish('/actions/humidity/', 'hello');
      client.publish('/actions/humidity', 'radical');
      client.publish('/states/thing/go', '23434');

      setTimeout(() => {
        const action = automate.logging.history.getHistory().then(history => {
          if (history.length !== 3){
            reject('Expected history.length: got'+history.length);
          }
          resolve();
        }).catch(reject);
      }, 30);
    })
  ));
});


