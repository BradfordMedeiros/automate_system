

const automate_sys = require('./index');

automate_sys.init({
  resourceFile: './test.db',
  mqttPort: 80,
  startMqtt: true,
});

