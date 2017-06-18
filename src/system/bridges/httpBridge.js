
const express = require('express');


let server = undefined;


function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function rawBodyMiddleware(req, res, next) {
  req.setEncoding('utf8');
  req.rawBody = '';
  req.on('data', function(chunk) {
    req.rawBody += chunk;
  });
  req.on('end', function(){
    if (isJSON(req.rawBody)){
      req.rawBody = JSON.parse(req.rawBody);
    }
    next();
  });
}

const startBridge = (publishMqtt, { httpBridgePort = 1656} = {}) => {
  if (typeof(publishMqtt) !== 'function'){
    throw (new Error('publishMqtt is not defined, cannot start the bridge'));
  }

  return new Promise((resolve, reject) => {
    const app = express();
    app.use(rawBodyMiddleware);

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
        resolve();
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