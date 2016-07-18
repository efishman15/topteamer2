var path = require('path');
var exceptions = require(path.resolve(__dirname,'./exceptions'));

//--------------------------------------------------------------------------
// download
//
// data: <NA>
//--------------------------------------------------------------------------
module.exports.download = function (req, res, next) {

  console.log('start download');
  var platform = req.params.platform;
  if (!platform || platform === undefined) {
    platform = 'android';
  }
  else if (platform !== 'android') {
    new exceptions.ServerResponseException(res, 'supported platforms are: android', {}, 'warn', 403);
    return;
  }

  var version = req.params.version;
  if (!version || version === undefined) {
    version = '';
  }
  else if (version !== 'armv7' && version !== 'x86') {
    new exceptions.ServerResponseException(res, 'supported versions are: armv7, x86 or do not specify version for the standard version', {}, 'warn', 403);
    return;
  }

  var downloadDir = '../build' + platform + '/apks/release/';
  var fileNameFriendlyName = 'topteamer';
  var fileName = downloadDir + 'topteamer-release';
  if (version) {
    fileNameFriendlyName += '-' + version;
    fileName += '-' + version;
  }
  fileName += '.apk';
  fileNameFriendlyName += '.apk';

  var downloadFile = path.resolve(__dirname,fileName);

  res.download(downloadFile, fileNameFriendlyName);

}
