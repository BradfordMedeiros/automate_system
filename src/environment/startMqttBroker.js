const mosca = require('mosca');

//https://github.com/mcollina/mosca/blob/master/examples/Server_With_All_Interfaces-Settings.js
const startMqttBroker = ({ mqttPort = 1883, httpPort = 4000, useInternalBroker = true } = { }) => {
  if (useInternalBroker){
    console.log('using internal');
    const moscaSetting = {
      interfaces: [
        { type: "mqtt", port: mqttPort },
        { type: "http", port: httpPort },
      ],
    };
    return (new Promise((resolve, reject) => {
      const server = new mosca.Server(moscaSetting);

      server.on('ready', () => {
        resolve(server);
      });

      server.on("error", function (err) {
        reject(err);
      });
    }));
  }else{
    console.log('using external');
    return new Promise((resolve, reject) => {
      resolve({
        close: () => {},
      })
    })
  }
};

module.exports = startMqttBroker;
