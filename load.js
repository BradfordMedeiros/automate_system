

const automate_sys = require('./src/index');

automate_sys.init({
  resourceFile: './test.db',
  startMqtt: true,
});

