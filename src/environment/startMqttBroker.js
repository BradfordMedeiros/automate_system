const mosca = require('mosca');

//https://github.com/mcollina/mosca/blob/master/examples/Server_With_All_Interfaces-Settings.js
const startMqttBroker = ({ mqttPort = 1883, httpPort = 4000 } = { }) => {
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

};

module.exports = startMqttBroker;
