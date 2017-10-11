
const handleMessage = (client, { onState, onAction, onSequence, onEvent, onHistory, onTopic }) => (topic, message) => {
  if (topic.indexOf('states/') === 0){
    if (onState){
      onState(topic, message.toString(), client);
    }
  }else if (topic.indexOf('actions/') === 0){
    if (onAction){
      onAction(topic, message.toString(), client);
    }
  }else if (topic.indexOf('events/') === 0){
    if (onEvent){
      onEvent(topic, message.toString(), client);
    }
  }else if (topic.indexOf('sequences/') === 0){
    if (onSequence){
      onSequence(topic, message.toString(), client);
    }
  }

  if (onTopic){
    onTopic(topic, message.toString(), client);
  }
  if (onHistory){
    onHistory(topic, message.toString(), client);
  }
};

module.exports = handleMessage;