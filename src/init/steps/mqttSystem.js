
const mqtt =  require('mqtt');


const listenForMqttMessage = ({ mqttPort = 1883}) => {
  const client = mqtt.connect(`http://127.0.0.1:${mqttPort}`);

  return new Promise((resolve, reject) => {
    const handle = setTimeout(reject, 3000);
    client.on('error', reject);
    client.on('connect', () => {
      clearTimeout(handle);
      client.subscribe('#');
      resolve(client);
    });
  });
};

module.exports = listenForMqttMessage;