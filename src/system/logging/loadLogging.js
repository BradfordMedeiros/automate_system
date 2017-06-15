const events = require('./events/events');
const history = require('./history/history');

const loadLogging = db => {
  return new Promise((resolve, reject) => {
    const logging = {
      events: {
        onEventData: (topic, value) => events.onEventData(db, topic, value),
        getEvents: () => events.getEvents(db),
      },
      history: {
        onHistoryData: (topic, value) => history.onHistoryData(db, topic, value),
        getHistory: () => history.getHistory(db),
      },
    };
    resolve(logging);
  });
};

module.exports = loadLogging;
