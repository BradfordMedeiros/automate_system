
const path = require('path');
const fs = require('fs');
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
  beforeEach(() => {
    return new Promise((resolve, reject) => {
      automate_system.init(options).then(system => {
        const resourceExists = fs.existsSync(resourceFilePath);
        if (resourceExists){
          automate = system;
          resolve();
        }else{
          reject(resourceFilePath + ' does not exist');
        }
      }).catch(reject);
    })
  });
  afterEach(() => {
   automate.stop();
  });
  it('creates a resource file in path specified', () => {
      const resourceFileExists = fs.existsSync(resourceFilePath);
      if (!resourceFileExists){
        throw (new Error('Resource file does not exist '+resourceFilePath));
      }
  });
  it ('', () => {


  });

});


