
part0 = [];
part1 = [{ type: 'wait', value: 2000 } ];
part2 = [
  { type: 'wait', value: 2000 },
  { type: 'action', value: () => console.log('yes') },
];

const automate_sys = require('./src/index');

automate_sys.init({
  resourceFile: './test.db',
  verbose: true,
  mqtt: {
    // need to add: mqttIp
    useInternalBroker: true,
    mqttPort: 1883,
    httpPort: 4000,
  },
  httpBridge: {
    enabled: true,
    port: 1657,
  },
  onEvent: ({ eventName, message }) => {
   console.log('event name: ', eventName);
   console.log('message: ', message);
  } ,
}).then(system => sys = system);


/*

  Next to do:  scheduler?
  then: test shit out of it, extra error handling, etc
  then get automate_core back up to date
 */
