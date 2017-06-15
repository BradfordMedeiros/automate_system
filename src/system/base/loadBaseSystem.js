const actions = require('./actions/actions');
const states = require('./states/states');
const conditions = require('./conditions/conditions');
//const events = require('./events/events');

const loadSystem = db => {
  const loadActions = actions.loadActions(db);
  const loadStates = states.loadStates(db);

  const systemLoaded = Promise.all([loadActions, loadStates]);

  const systemWithoutConditionsLoaded =  new Promise((resolve, reject) => {
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
          getStates: conditions.getStates,
        },
        /*events: {
          onEventData: (topic, value) => events.onEventData(db, topic, value),
          getEvents: () => events.getEvents(db),
        }*/
      });
      resolve(system);
    })
  });

  return new Promise((resolve, reject) => {
    systemWithoutConditionsLoaded.then(system => {
      conditions.loadConditions(db, system.states.getStates).catch(reject).then(() => { resolve(system) });
    });
  });
};

module.exports = loadSystem;
