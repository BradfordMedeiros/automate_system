
part0 = [];
part1 = [{ type: 'wait', value: 2000 } ];
part2 = [
  { type: 'wait', value: 2000 },
  { type: 'action', value: () => console.log('yes') },
];

const automate_sys = require('./src/index');

automate_sys.init({
  resourceFile: './test.db',
  startMqtt: true,
});

