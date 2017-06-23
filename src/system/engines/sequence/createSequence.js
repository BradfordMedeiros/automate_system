
const sequencer = require('when_do').sequencer;

const translatePart = (sequencerSession, part, getActions) => {
  if (part.type === 'action'){
    const functionEval = getActions()[part.value] ? getActions()[part.value]: 'default action';
    return sequencerSession.then(() => console.log('perform: ', functionEval));
  }else if (part.type === 'wait'){
    return sequencerSession.wait(part.value);
  }
};

/*const r = {
  rr : [
    {
      type: 'broadcast_mqtt',
      options: {
        topic: '/actions/door',
        value: 'open',
        iterations: 2000,
        wait: 100,
      }
    },
    {
      type: 'wait',
      value: : 2000
    },

  ]
};*/

const createRunFromSequenceParts = (sequenceParts, getActions) => {
  let sequencerSession = sequencer();
  sequenceParts.forEach(part => {
    sequencerSession = translatePart(sequencerSession, part, getActions);
  });
  return sequencerSession;
};

module.exports = createRunFromSequenceParts;