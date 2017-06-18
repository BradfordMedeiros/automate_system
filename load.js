
part0 = [];
part1 = [{ type: 'wait', value: 2000 } ];
part2 = [
  { type: 'wait', value: 2000 },
  { type: 'action', value: () => console.log('yes') },
];

const automate_sys = require('./src/index');

automate_sys.init({
  resourceFile: './test.db',

  mqtt: {
    mqttPort: 1882,
    httpPort: 4000,
  },
  httpBridge: {
    enabled: true,
    port: 1657,
  },
}).then(system => sys = system);


