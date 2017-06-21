
const startHttpBridge = (theSystem, mqttClient, port) => {
  return theSystem.bridges.httpBridge.start(
    mqttClient.publish.bind(mqttClient),
    theSystem.logging.history.getMqttValue.bind(theSystem.logging.history),
    { httpBridgePort: port }
  );
};

module.exports = startHttpBridge;