
const handleMessage = (client, { onState, onAction, onSequence, onEvent, onHistory }) => (topic, message) => {
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

module.exports = handleMessage;