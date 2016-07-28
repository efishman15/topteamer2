var path = require('path');
var logger = require('bunyan');

//Server log is dual - both to a file and to the console
module.exports.server = logger.createLogger({
  name: 'topTeamerServer',
  streams: [
    {
      type: 'rotating-file',
      path: path.resolve(__dirname, '../logs/server.log'),
      period: '1d',   // daily rotation
      count: 30        // keep back copies
    },
    {
      stream: process.stderr
      // `type: 'stream'` is implied
    }],
  serializers: {
    req: reqSerializer
  }
});

module.exports.client = logger.createLogger({
  name: 'client',
  streams: [{
    type: 'rotating-file',
    path: path.resolve(__dirname, '../logs/client/client.log'),
    period: '1d',   // daily rotation
    count: 180        // keep back copies
  }],
  serializers: {
    req: reqSerializer
  }
});

module.exports.paypalIPN = logger.createLogger({
  name: 'topTeamerPayPalIPN',
  streams: [{
    type: 'rotating-file',
    path: path.resolve(__dirname, '../logs/paypal/paypalIPN.log'),
    period: '1d',   // daily rotation
    count: 180        // keep back copies
  }],
  serializers: {
    req: reqSerializer
  }
});

module.exports.facebookIPN = logger.createLogger({
  name: 'topTeamerFacebookIPN',
  streams: [{
    type: 'rotating-file',
    path: path.resolve(__dirname, '../logs/facebook/facebookIPN.log'),
    period: '1d',   // daily rotation
    count: 180        // keep back copies
  }],
  serializers: {
    req: reqSerializer
  }
});

//-------------------------------------------------------------------------------------
// Private functions
//-------------------------------------------------------------------------------------
function reqSerializer(req) {
  return {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  }
}
