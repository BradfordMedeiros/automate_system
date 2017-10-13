
const mapSystemToApiLayer = (system, raw) => {
  if (raw) {
    return system;
  }else{
    const systemApi = {
      baseSystem: {
        actions: {
          getActions: system.baseSystem.actions.getActions,
          forceAddAction: (topic, value) => system.baseSystem.actions.onActionData(`actions/${topic}`, value || ''),
          unregister: system.baseSystem.actions.unregister,
        },
        states: {
          getStates: system.baseSystem.states.getStates,
          forceAddState: (topic, value) => system.baseSystem.states.onStateData(`states/${topic}`, value || ''),
          unregister: system.baseSystem.states.unregister,
        },
        conditions: system.baseSystem.conditions,
      },
      engines: {
        stateScriptEngine: system.engines.stateScriptEngine,
        actionScriptEngine: {
          addActionScript: system.engines.actionScriptEngine.addActionScript,
          deleteActionScript: system.engines.actionScriptEngine.deleteActionScript,
          getActionScripts: system.engines.actionScriptEngine.getActionScripts,
        },
        sequenceEngine: system.engines.sequenceEngine,
        ruleEngine: system.engines.ruleEngine,
        schedulerEngine: {
          addSchedule: system.engines.schedulerEngine.addSchedule,
          deleteSchedule: system.engines.schedulerEngine.deleteSchedule,
          getSchedules: system.engines.schedulerEngine.getSchedules,
        },
      },
      logging: {
        history: {
          getHistory: system.logging.history.getHistory,
        },
        events: {
          getEvents: system.logging.events.getEvents,
        }
      },
      env: system.env,
    };

    systemApi.stop = () => {
      system.stop();
      delete systemApi.stop;
      delete systemApi.baseSystem;
      delete systemApi.engines;
      delete systemApi.logging;
    };
    return systemApi;
  }
};

module.exports = mapSystemToApiLayer;