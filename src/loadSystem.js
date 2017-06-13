const actions = require('./system/actions/actions');
const states = require('./system/states/states');
const events = require('./system/events/events');
const conditions = require('./system/conditions/conditions');

const loadSystem = db => {
  const loadActions = actions.loadActions(db);
  const loadStates = states.loadStates(db);
  const loadConditions = conditions.loadConditions(db);

  const systemLoaded = Promise.all([loadActions, loadStates, loadConditions]);

  return new Promise((resolve, reject) => {
    systemLoaded.catch(reject).then(() => {
      const system =  ({
        actions: {
          getActions: () => actions.getActions(),
          onActionData: (topic, value) => actions.onActionData(db, topic, value),
          unregister: (topic) => actions.unregisterAction(db, topic),
        },
        states: {
          getStates: () => states.getStates(),
          onStateData: (topic, value) => states.onStateData(db, topic, value),
          unregister: (topic) => states.unregisterState(db, topic),
        },
        conditions: {
          getConditions: conditions.getConditions,
          addCondition: (name, eval) => conditions.addCondition(db, name, eval),
          deleteCondition: (name) => conditions.deleteCondition(db, name),
        },
        events: {
          onEventData: (topic, value) => events.onEventData(db, topic, value),
          getEvents: () => events.getEvents(db),
        }
      });
      resolve(system);
    })
  });
};

module.exports = loadSystem;
