const handleError = err => {
  console.log(err);
};

const createSystemHooks = (theSystem, onEvent) => ({
  onState: (topic, messsage) => {
    theSystem.baseSystem.states.onStateData(topic, messsage).catch(handleError);
  },
  onAction: (topic, message, client) => {
    theSystem.baseSystem.actions.onActionData(topic, message).catch(handleError);
    const data = theSystem.engines.actionScriptEngine.onMqttTopic(topic, message);
    data.forEach(item => {
      client.publish(item.toTopic, item.value.toString(), (err) => {
        console.log(err);
      });
    })
  },
  onSequence: (topic, message) => {
    // match the sequence and call execute
    const sequenceName = topic.split('/').filter(x => x.length > 0).slice(1).join('/');
    const matchingSequence = theSystem.engines.sequenceEngine.getSequences()[sequenceName];
    if (matchingSequence) {
      matchingSequence.run();
    }
  },
  onEvent: (topic, message) => {
    theSystem.logging.events.onEventData(topic, message).catch(handleError);
    if (onEvent){
      onEvent({ eventName: topic, message });
    }
  },
  onHistory: (topic, message) => {
    theSystem.logging.history.onHistoryData(topic, message).catch(handleError);
  },
});


module.exports = createSystemHooks;