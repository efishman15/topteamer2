var path = require('path');
var async = require('async');
var dalFacebook = require(path.resolve(__dirname, '../dal/dalFacebook'));
var exceptions = require(path.resolve(__dirname, '../utils/exceptions'));
var generalUtils = require(path.resolve(__dirname, '../utils/general'));
var sessionUtils = require(path.resolve(__dirname, '../business_logic/session'));
var dalDb = require(path.resolve(__dirname, '../dal/dalDb'));
var paymentUtils = require(path.resolve(__dirname, '../business_logic/payments'));
var logger = require(path.resolve(__dirname, '../utils/logger'));
var util = require('util');

//------------------------------------------------------------------------------------------------
// Private functions
//------------------------------------------------------------------------------------------------

//----------------------------------------------------
// getContestName
//
//----------------------------------------------------
function getContestName(contest) {

  var contestName = generalUtils.translate(contest.language, 'CONTEST_NAME_LONG',
    {
      'team0': contest.teams[0].name,
      'team1': contest.teams[1].name,
      'type': contest.subject
    });

  return contestName;
}

//----------------------------------------------------
// renderContest
//
//----------------------------------------------------
function renderContest(viewName, req, res, next) {

  if (!req.params.contestId) {
    new exceptions.ServerResponseException(res, 'contestId is required', {}, 'warn', 403);
    return;
  }

  dalDb.connect(function (err, data) {

    data.contestId = req.params.contestId;
    data.closeConnection = true;

    dalDb.getContest(data, function (err, data) {

      res.render(viewName,
        {
          'appId': generalUtils.settings.server.facebook.appId,
          'title': getContestName(data.contest),
          'description': generalUtils.settings.server.text[data.contest.language].gameDescription,
          'contestId': req.params.contestId
        });
    });
  });
};

//----------------------------------------------------
// renderTeam
//
//----------------------------------------------------
function renderTeam(viewName, req, res, next) {

  if (!req.params.contestId) {
    new exceptions.ServerResponseException(res, 'contestId is required', {}, 'warn', 403);
    return;
  }

  if (req.params.teamId == null) {
    new exceptions.ServerResponseException(res, 'teamId required', {}, 'warn', 403);
    return;
  }
  if (req.params.teamId !== '0' && req.params.teamId !== '1') {
    new exceptions.ServerResponseException(res, 'teamId must be 0 or 1', {}, 'warn', 403);
    return;
  }

  var teamId = parseInt(req.params.teamId, 10);

  dalDb.connect(function (err, data) {

    data.contestId = req.params.contestId;
    data.closeConnection = true;

    dalDb.getContest(data, function (err, data) {

      console.log('userAgent:' + res.userAgent);
      res.render(viewName,
        {
          'appId': generalUtils.settings.server.facebook.appId,
          'title': util.format(generalUtils.settings.server.text[data.contest.language].teamTitle, data.contest.teams[teamId].name, getContestName(data.contest)),
          'description': generalUtils.settings.server.text[data.contest.language].gameDescription,
          'contestId': req.params.contestId,
          'teamId': req.params.teamId
        });
    });
  });

}

//----------------------------------------------------------------------------------------------------------------------------------------------------
// canvas
//
// Comming from facebook canvas post
//
// data: signed_request
//
// The signed_request is used only to verify if the user is logged in and
// has authorized the app.
// In both cases server redirects to client '/fb' route state with 2 states:
// 1. connected=true - the signed request is also sent back to the client and client will authenticate our server again with this signed request.
// 2. connected=false - 'standard' scenario using client JS SDK to authenticate to facebook
//----------------------------------------------------------------------------------------------------------------------------------------------------
module.exports.canvas = function (req, res, next) {
  var data = req.body;
  var verifier = new dalFacebook.SignedRequest(generalUtils.settings.server.facebook.secretKey, data.signed_request);
  if (!verifier.verify) {
    new exceptions.ServerResponseException(res, 'Invalid signed request received from facebook', {'facebookData': data});
    return;
  }

  var redirectUrl = generalUtils.settings.server.facebook.signedRequestRedirectUrl;
  var language = generalUtils.getLanguageByCountryCode(verifier.data.user.country.toUpperCase())
  redirectUrl += '?signedRequest=' + data.signed_request + '&language=' + language;
  if (verifier.data.oauth_token) {
    redirectUrl += '&connected=true';
  }
  else {
    redirectUrl += '&connected=false';
  }
  res.redirect(redirectUrl);
}

//----------------------------------------------------
// getProductDetails
//
//----------------------------------------------------
module.exports.getProductDetails = function (req, res, next) {

  var productId = req.params.productId;
  var language = req.params.language;

  var product = generalUtils.settings.server.payments.purchaseProducts[productId];
  if (product) {

    if (product.displayNames[language]) {
      res.render('fbproduct',
        {
          'title': product.displayNames[language],
          'description': product.displayNames[language],
          'productUrl': generalUtils.settings.client.general.baseUrlSecured + 'fb/payments?productId=' + productId + '&language=' + language,
          'language': language,
          'productId': productId
        });
    }
    else {
      new exceptions.ServerResponseException(res, 'Invalid language received from facebook', {
        'productId': productId,
        'language': language
      }, 'warn', 403);
    }
  }
  else {
    new exceptions.ServerResponseException(res, 'Invalid product id received from facebook', {'productId': productId}, 'warn', 403);
  }
}

//----------------------------------------------------
// getGameDetails
//
//----------------------------------------------------
module.exports.getGameDetails = function (req, res, next) {

  if (!req.params.language) {
    new exceptions.ServerResponseException(res, 'language is required', {}, 'warn', 403);
    return;
  }

  res.render('fbgame',
    {
      'appId': generalUtils.settings.server.facebook.appId,
      'title': generalUtils.settings.server.text[req.params.language].gameTitle,
      'description': generalUtils.settings.server.text[req.params.language].gameDescription,
      'language': req.params.language
    });
};

//----------------------------------------------------
// getProfileDetails
//
//----------------------------------------------------
module.exports.getProfileDetails = function (req, res, next) {

  if (!req.params.id) {
    new exceptions.ServerResponseException(res, 'id is required', {}, 'warn', 403);
    return;
  }

  if (!req.params.language) {
    new exceptions.ServerResponseException(res, 'language is required', {}, 'warn', 403);
    return;
  }

  dalFacebook.getGeneralProfile(req.params.id, function (err, facebookData) {

    if (err) {
      new exceptions.ServerResponseException(res, err.message, err, 'warn', 403);
      return;
    }

    res.render('fbprofile',
      {
        'appId': generalUtils.settings.server.facebook.appId,
        'id': facebookData.id,
        'name': facebookData.name,
        'firstName': facebookData.first_name,
        'lastName': facebookData.last_name,
        'description': generalUtils.settings.server.text[req.params.language].gameDescription,
        'language': req.params.language,
        'redirectLink': generalUtils.settings.client.general.downloadUrl[req.params.language]
      });

  });

};

//----------------------------------------------------
// getContestDetails
//
//----------------------------------------------------
module.exports.getContestDetails = function (req, res, next) {
  renderContest('fbcontest', req, res, next);
};

//----------------------------------------------------
// getContestLeaderDetails
//
//----------------------------------------------------
module.exports.getContestLeaderDetails = function (req, res, next) {
  renderContest('fbcontestleader', req, res, next);
};

//----------------------------------------------------
// getTeamDetails
//
//----------------------------------------------------
module.exports.getTeamDetails = function (req, res, next) {
  renderTeam('fbteam', req, res, next);
};

//----------------------------------------------------
// getTeamLeaderDetails
//
//----------------------------------------------------
module.exports.getTeamLeaderDetails = function (req, res, next) {
  renderTeam('fbteamleader', req, res, next);
};


//----------------------------------------------------
// getChallenge
//
//----------------------------------------------------
module.exports.getChallenge = function (req, res, next) {

  console.log('facebook coming 2...');
  var hubChallenge = req.query['hub.challenge'];
  if (hubChallenge) {
    res.send(200, hubChallenge);
    res.end();
    return;
  }
  else {
    res.send(500);
  }
}

//----------------------------------------------------
// paymentFlow
//
//----------------------------------------------------
module.exports.dynamicPricing = function (req, res, next) {

  var data = req.body;
  var verifier = new dalFacebook.SignedRequest(generalUtils.settings.server.facebook.secretKey, data.signed_request);
  if (!verifier.verify) {
    new exceptions.ServerResponseException(res, 'Invalid signed request received from facebook', {'facebookData': data}, 'warn', 403);
    return;
  }

  //requestId in the format  featureName|timeStamp
  var requestIdParts = data.request_id.split('|');
  var featureName = requestIdParts[0];

  //The user's session holds the features with the adjusted cost for the feature (e.g. for mobile payments)
  data.facebookUserId = verifier.data.user_id;

  data.clientResponse = {};

  var operations = [

    //getSession
    function (callback) {
      sessionUtils.getSession(data, callback);
    },

    function (data, callback) {
      if (!data.session.features[featureName]) {
        dalDb.closeDb(data);
        callback(new exceptions.ServerResponseException(res, 'Invalid signed request received from facebook', {'facebookData': data}, 'warn', 403));
        return;
      }

      data.clientResponse.method = data.method;
      data.clientResponse.content = {};
      data.clientResponse.content.product = data.product;
      data.clientResponse.content.amount = data.session.features[featureName].purchaseData.cost;
      data.clientResponse.content.currency = data.session.features[featureName].purchaseData.currency;
      dalDb.closeDb(data);

      callback(null, data);
    }
  ]

  async.waterfall(operations, function (err, data) {
    if (!err) {
      res.json(data.clientResponse);
    }
    else {
      res.send(err.httpStatus, err);
    }
  });
}

//---------------------------------------------------------
// ipn
//
// Request coming from facebook servers about ta payment
//---------------------------------------------------------
module.exports.ipn = function (req, res, next) {

  var data = req.body;

  logger.facebookIPN.info(data, 'incoming facebook ipn');

  data.method = 'facebook';
  data.thirdPartyServerCall = true;

  data.sessionOptional = true;
  data.paymentId = data.entry[0].id; //Coming from facebook server

  paymentUtils.innerProcessPayment(data, function (err, response) {
    if (!err) {
      res.send(200);
    }
    else if (err.message === 'DuplicatePurchase') {
      logger.facebookIPN.info(data, 'Duplicate purchase - already credited online');
      res.send(200);
    }
    else {
      logger.facebookIPN.info(err, 'Error during processing facebook ipn message');
      res.send(500);
    }
  });
}
