
const actions = require('./system/actions/actions');
const states = require('./system/states/states');

const loadSystem = db => {
  const loadActions = actions.loadActions(db);
  const loadStates = states.loadStates(db);

  const systemLoaded = Promise.all([loadActions, loadStates]);


  return new Promise((resolve, reject) => {
    systemLoaded.catch(reject).then(() => {
      const system =  ({
        actions: {
          getActions: () => actions.getActions(),
          onActionData: (topic, value) => actions.onActionData(db, topic, value),
        },
        states: {
          getStates: () => states.getStates(),
          onStateData: (topic, value) => states.onStateData(db, topic, value),
        },
      });
      resolve(system);
    })
  });
};

module.exports = loadSystem;