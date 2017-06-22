
const mqtt =  require('mqtt');

const createClient = ({ mqttPort = 1883}) => {
  const client = mqtt.connect(`http://127.0.0.1:${mqttPort}`);

  return new Promise((resolve, reject) => {
    client.on('error', reject);
    client.on('connect', () => {
      client.subscribe('#');
      resolve(client);
    });
  });
};

module.exports = createClient;