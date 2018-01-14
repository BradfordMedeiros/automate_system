
const sequencer = require('when_do').sequencer;

const translatePart = (sequencerSession, part, getMqttClient) => {
  if (part.type === 'action'){
    const topic = part.options.topic;
    const value = part.options.value;
    return sequencerSession.then(() => getMqttClient().publish(topic, value));
  }else if (part.type === 'wait'){
    return sequencerSession.wait(Number(part.options));
  }
};


const createRunFromSequenceParts = (sequenceParts, getMqttClient) => {
  let sequencerSession = sequencer();
  sequenceParts.forEach(part => {
    sequencerSession = translatePart(sequencerSession, part, getMqttClient);
  });
  return sequencerSession;
};

const isValidWait = options => {
  return Number.isInteger(Number(options));
};

const isValidAction = options => {
  return (
    (options !== undefined) &&
    (typeof(options.topic) === typeof('')) &&
    (typeof(options.value) === typeof(''))
  );
};

const isValidParts = sequenceParts => {
  if (Array.isArray(sequenceParts)){
    const validParts = sequenceParts.filter(part => {
      if (part.type === 'action'){
        return isValidAction(part.options);
      }else if (part.type === 'wait'){
        return isValidWait(part.options);
      }else{
        return false;
      }
    });

    return validParts.length === sequenceParts.length;
  }else{
    return false;
  }
};

module.exports = {
  create: createRunFromSequenceParts,
  isValidParts,
};