


const rawBodyMiddleware = (req, res, next) => {
  req.setEncoding('utf8');
  req.rawBody = '';
  req.on('data', function(chunk) {
    req.rawBody += chunk;
  });
  req.on('end', function(){
    next();
  });
};

module.exports = rawBodyMiddleware;