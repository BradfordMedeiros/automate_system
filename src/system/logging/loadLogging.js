const events = require('./events/events');
const history = require('./history/history');

const loadLogging = db => {
  return new Promise((resolve, reject) => {
    const logging = {
      events: {
        onEventData: (topic, value) => events.onEventData(db, topic, value),
        getEvents: options => events.getEvents(db, options),
      },
      history: {
        onHistoryData: (topic, value) => history.onHistoryData(db, topic, value),
        getHistory: options => history.getHistory(db, options),
        getMqttValue: history.getMqttValue,
      },
    };
    resolve(logging);
  });
};

module.exports = loadLogging;
