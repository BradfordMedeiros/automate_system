
const start = require('./startSystem');
const mapSystemToApiLayer = require('./mapSystemToApiLayer');

const init = ({
  resourceFile,
  mqtt,
  httpBridge,
}) => {
  if (typeof(resourceFile) !== typeof('')){
    throw (new Error("Resource file string must be defined"));
  }

  return new Promise((resolve, reject) => {
    start({
      resourceFile,
      mqtt,
      httpBridge,
    }).then(system => {
      resolve(mapSystemToApiLayer(system, false));
    }).catch(reject);
  });
};

const automate_sys = {
  init,
};

module.exports = automate_sys;
