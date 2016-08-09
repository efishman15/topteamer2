var path = require('path');
var async = require('async');
var dalDb = require(path.resolve(__dirname, '../dal/dalDb'));
var dalFacebook = require(path.resolve(__dirname, '../dal/dalFacebook'));
var exceptions = require(path.resolve(__dirname, '../utils/exceptions'));
var generalUtils = require(path.resolve(__dirname, '../utils/general'));
var sessionUtils = require(path.resolve(__dirname, './session'));
var commonBusinessLogic = require(path.resolve(__dirname, './common'));

//--------------------------------------------------------------------------
// private functions
//--------------------------------------------------------------------------
function getSessionResponse(session) {
  var clientSession = {
    token: session.userToken,
    userId: session.userId,
    thirdParty: {'id': session.facebookUserId}, //For older clients
    name: session.name,
    score: session.score,
    rank: session.rank,
    xpProgress: new generalUtils.XpProgress(session.xp, session.rank),
    settings: session.settings,
    features: session.features,
    avatar: commonBusinessLogic.getAvatar(session)
  };


  if (session.isAdmin) {
    clientSession.isAdmin = true;
  }

  if (session.justRegistered) {
    clientSession.justRegistered = true;
  }

  if (session.gcmRegistrationId) {
    clientSession.gcmRegistrationId = session.gcmRegistrationId;
  }

  return clientSession;
}

//-----------------------------------------------------------------------------------------------------------
// connect
//
// data: user - should contain:
//          credentials (type (facebook, guest),
//            - in case of facebook: facebookInfo(userId, accessToken)
//            - in case of guest: guestInfo(uuid)
//          clientInfo (platform, appVersion (optional for apps), platformVersion (optional for apps)
//          gcmRegistrationId (optional)
//-----------------------------------------------------------------------------------------------------------
module.exports.connect = function (req, res, next) {
  var data = req.body;

  var clientResponse = {};

  var operations = [

    function (callback) {
      if (data.user.credentials.type === 'facebook') {
        //Validate facebook access token with facebook
        dalFacebook.getUserInfo(data, callback);
      }
      else {
        callback(null, data);
      }
    },

    //Open db connection
    function (data, callback) {
      dalDb.connect(callback);
    },

    //Try to login (or register) with the facebook info supplied
    function (connectData, callback) {
      data.DbHelper = connectData.DbHelper;
      if (data.user && data.user.clientInfo && req.headers['user-agent']) {
        data.user.clientInfo.userAgent = req.headers['user-agent'];
      }
      dalDb.login(data, callback)
    },

    //Compute features and create/update session
    function (data, callback) {
      data.features = sessionUtils.computeFeatures(data.user);
      data.closeConnection = true;
      dalDb.createOrUpdateSession(data, callback);
    },

    //Build session for client and check app version
    function (data, callback) {
      clientResponse.session = getSessionResponse(data.session);
      var serverPopup = generalUtils.checkAppVersion(data.session.clientInfo, data.session.settings.language);
      if (serverPopup) {
        clientResponse.serverPopup = serverPopup;
      }
      callback(null, data);
    }
  ];

  async.waterfall(operations, function (err, data) {
    if (!err) {
      res.json(clientResponse);
    }
    else {
      res.send(err.httpStatus, err);
    }
  });
};


//-----------------------------------------------------------------------------------------------------------
// facebookConnect
//
// data: user - should contain:
//          thirdParty (id, type, accessToken)
//          clientInfo (platform, appVersion (optional for apps), platformVersion (optional for apps)
//          gcmRegistrationId (optional)
// This is a Legacy function - for older clients - reverting to "connect" method
//-----------------------------------------------------------------------------------------------------------
module.exports.facebookConnect = function (req, res, next) {

  //Legacy - revert to "connect" method
  req.body.user.credentials = {
    type: 'facebook',
    facebookInfo: {
      userId: req.body.user.thirdParty.id,
      accessToken: req.body.user.thirdParty.accessToken
    }
  }

  this.connect(req, res, next);
}

//--------------------------------------------------------------------------
// logout
//
// data: token
//--------------------------------------------------------------------------
module.exports.logout = function (req, res, next) {
  var token = req.headers.authorization;

  var operations = [

    //Connect
    dalDb.connect,

    //Logout
    function (data, callback) {
      data.token = token;
      data.closeConnection = true;
      dalDb.logout(data, callback);
    }
  ];

  async.waterfall(operations, function (err) {
    if (!err) {
      res.json(generalUtils.okResponse);
    }
    else {
      res.send(err.httpStatus, err);
    }
  })
};
