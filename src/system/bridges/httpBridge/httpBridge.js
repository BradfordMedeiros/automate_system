
const express = require('express');
const rawBodyMiddleware  = require('./rawBodyMiddleware');

let server = undefined;


const startBridge = (publishMqtt, getMqttValue, { httpBridgePort = 1656} = {}) => {
  if (typeof(publishMqtt) !== 'function'){
    throw (new Error('publishMqtt is not defined, cannot start the bridge'));
  }

  return new Promise((resolve, reject) => {
    const app = express();
    app.use(rawBodyMiddleware);

    app.get('*', (req,res) => {
      const mqttTopic = req.url;
      const mqttData = getMqttValue(mqttTopic);
      res.send(mqttData);
    });

    app.post('*', (req, res) => {
      const mqttTopic = req.url;
      const mqttData = JSON.stringify(req.rawBody);
      publishMqtt(mqttTopic, mqttData);
      res.send('ok');
    });

    server = app.listen(httpBridgePort, (err) => {
      if (err){
        reject(err);
      }else{
        resolve(server);
      }
    });
  });

};

const stopBridge = () => {
  if (server){
    server.close();
  }
};

module.exports = {
  startBridge,
  stopBridge,
};