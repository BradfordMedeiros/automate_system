
const start = require('./init/startSystem');
const mapSystemToApiLayer = require('./mapSystemToApiLayer');

const init = ({
  resourceFile,
  mqtt,
  httpBridge,
  verbose,
}) => {
  if (typeof(resourceFile) !== typeof('')){
    throw (new Error("Resource file string must be defined"));
  }

  return new Promise((resolve, reject) => {
    start({
      resourceFile,
      mqtt,
      httpBridge,
      verbose,
    }).then(system => {
      resolve(mapSystemToApiLayer(system, false));
    }).catch(reject);
  });
};

const automate_sys = {
  init,
};

module.exports = automate_sys;
