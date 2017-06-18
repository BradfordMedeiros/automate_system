
const httpBridge = require('./httpBridge');

const loadBridges = publishMqtt => ({
  httpBridge: ({
    start: httpBridge.startBridge,
    stop: httpBridge.stopBridge,
  })
});

module.exports = loadBridges;
