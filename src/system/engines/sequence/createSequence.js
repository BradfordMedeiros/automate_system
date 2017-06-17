
const sequencer = require('when_do').sequencer;

const translatePart = (sequencerSession, part, getActions) => {
  if (part.type === 'action'){
    const functionEval = getActions()[part.value] ? getActions()[part.value]: 'default action';
    return sequencerSession.then(() => console.log('perform: ', functionEval));
  }else if (part.type === 'wait'){
    return sequencerSession.wait(part.value);
  }
};

const createRunFromSequenceParts = (sequenceParts, getActions) => {
  let sequencerSession = sequencer();
  sequenceParts.forEach(part => {
    sequencerSession = translatePart(sequencerSession, part, getActions);
  });
  return sequencerSession;
};

module.exports = createRunFromSequenceParts;