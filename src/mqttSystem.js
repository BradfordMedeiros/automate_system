
const mqtt =  require('mqtt');
const MQTT_URL = 'http://127.0.0.1:1883';

const handleMessage = (topic, message, {
  onState,
  onAction,
  onSequence,
  onEvent,
  onHistory
}) => {
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
  }else if (topic.indexOf('/sequences') === 0 || topic.indexOf('sequences') === 0){
    console.log('is a seuqence');
    if (onSequence){
      console.log('on sequence');
      onSequence(topic, message.toString());
    }
  }

  if (onHistory){
    onHistory(topic, message.toString());
  }
};

const listenForMqttMessage = ({ onState, onAction, onSequence, onEvent, onHistory } = {}) => {
  const client = mqtt.connect(MQTT_URL);

  return new Promise((resolve, reject) => {
    const handle = setTimeout(reject, 5000);
    client.on('connect', () => {
      clearTimeout(handle);

      client.subscribe('#');
      client.on('message', (topic, message) => handleMessage(topic, message, { onState, onAction, onSequence, onEvent, onHistory }));

      resolve(client);
    });
    client.on('error', reject);
  });

  return client;
};

module.exports = listenForMqttMessage;