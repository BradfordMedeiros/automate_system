
const mqtt =  require('mqtt');

const handleMessage = (topic, message, client, {
  onState,
  onAction,
  onSequence,
  onEvent,
  onHistory
}) => {
  if (topic.indexOf('/states') === 0 || topic.indexOf('states') === 0){
    if (onState){
      onState(topic, message.toString(), client);
    }
  }else if (topic.indexOf('/actions') === 0 || topic.indexOf('actions') === 0){
    if (onAction){
      onAction(topic, message.toString(), client);
    }
  }else if (topic.indexOf('/events') === 0 || topic.indexOf('events') === 0){
    if (onEvent){
      onEvent(topic, message.toString(), client);
    }
  }else if (topic.indexOf('/sequences') === 0 || topic.indexOf('sequences') === 0){
    console.log('is a seuqence');
    if (onSequence){
      console.log('on sequence');
      onSequence(topic, message.toString(), client);
    }
  }

  if (onHistory){
    onHistory(topic, message.toString(), client);
  }
};

const listenForMqttMessage = ({ onState, onAction, onSequence, onEvent, onHistory } = {}, { mqttPort = 1883}) => {
  const client = mqtt.connect(`http://127.0.0.1:${mqttPort}`);

  return new Promise((resolve, reject) => {
    const handle = setTimeout(reject, 5000);
    client.on('connect', () => {
      clearTimeout(handle);

      client.subscribe('#');
      client.on('message', (topic, message) => handleMessage(
        topic,
        message,
        client,
        {
          onState,
          onAction,
          onSequence,
          onEvent,
          onHistory
        })
      );
      resolve(client);
    });
    client.on('error', reject);
  });
};

module.exports = listenForMqttMessage;