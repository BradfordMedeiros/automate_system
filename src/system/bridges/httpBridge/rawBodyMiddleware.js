

const isJSON = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const rawBodyMiddleware = (req, res, next) => {
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
};

module.exports = rawBodyMiddleware;