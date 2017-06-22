
const mapSystemToApiLayer = (system, raw) => {
  if (raw) {
    return system;
  }else{
    const systemApi = {
      baseSystem: {
        actions: {
          getActions: system.baseSystem.actions.getActions,
        },
        states: {
          getStates: system.baseSystem.states.getStates,
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
      off: system.off,
    };
    return systemApi;
  }
};

module.exports = mapSystemToApiLayer;