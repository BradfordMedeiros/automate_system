
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

module.exports = printStartMessage;