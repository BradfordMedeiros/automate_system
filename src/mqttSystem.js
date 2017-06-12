
const mqtt =  require('mqtt');
const MQTT_URL = 'http://127.0.0.1:1883';


const handleMessage = (topic, message, { onState, onAction, onEvent }) => {
  if (topic.indexOf('/states') === 0 || topic.indexOf('states') === 0){
    if (onState){
      onState(topic, message.toString());
    }
  }else if (topic.indexOf('/actions') === 0 || topic.indexOf('actions') === 0){
    if (onAction){
      onAction(topic, message.toString());
    }
  }else if (topic.indexOf('/events') === 0 || topic.indexOf('events') === 0){
    if (onEvent){
      onEvent(topic, message.toString());
    }
  }
};

const listenForMqttMessage = ({ onState, onAction, onEvent } = {}) => {
  const client = mqtt.connect(MQTT_URL);

  return new Promise((resolve, reject) => {
    const handle = setTimeout(reject, 5000);
    client.on('connect', () => {
      clearTimeout(handle);

      client.subscribe('/actions/'+'#');
      client.subscribe('actions/'+'#');

      client.subscribe('/states/'+'#');
      client.subscribe('states/'+'#');

      client.subscribe('/events/'+'#');
      client.subscribe('events'+'#');

      client.on('message', (topic, message) => handleMessage(topic, message, { onState, onAction, onEvent } ));

      resolve(client);
    });
    client.on('error', reject);
  });

  return client;
};

module.exports = listenForMqttMessage;