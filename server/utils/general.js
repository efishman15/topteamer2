var path = require("path");
var mathjs = require("mathjs");
var httpUtils = require(path.resolve(__dirname, "./http"));
var util = require("util");
var logger = require(path.resolve(__dirname, "./logger"));
var async = require("async");

var settings;
module.exports.injectSettings = function (dbSettings) {

  settings = dbSettings;

  //Compute unlockRank for each feature using the rankByXp settings
  for (var i = 0; i < settings.server.rankByXp.length; i++) {
    if (settings.server.rankByXp[i].unlockFeature) {
      settings.server.features[settings.server.rankByXp[i].unlockFeature].unlockRank = settings.server.rankByXp[i].rank;
    }
  }

  //Generate the "client visible" part of the server settings about the question scores
  settings.client.quiz.questions = {"score": []};
  for (var i = 0; i < settings.server.quiz.questions.levels.length; i++) {
    settings.client.quiz.questions.score.push(settings.server.quiz.questions.levels[i].score);
  }

  settings.client.newContest.systemTotalQuestions = settings.server.quiz.questions.levels.length;

  module.exports.settings = settings;

}

//-------------------------------------------------------------------------------
// Private functions
//-------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------------
// getGeoInfo
//
// Retrieves geoInfo based on client ip
// data: geoLocator (0,1,...), ip
//---------------------------------------------------------------------------------------------------
function getGeoInfo(data, callback) {

  if (data.geoLocator == null) {
    data.geoLocator = 0;
  }

  var options = {
    "url": util.format(settings.server.geoIpLocators[data.geoLocator].url, data.ip)
  };
  httpUtils.get(options, function (err, result) {
    if (err) {
      if (data.geoLocator < settings.server.geoIpLocators.length - 1) {
        data.geoLocator++;
        getGeoInfo(data, callback);
      }
      else {
        data.clientResponse.language = data.defaultLanguage;
        callback(null, data);
      }
      return;
    }

    var countryCode = result[settings.server.geoIpLocators[data.geoLocator].countryCodeField[0]];
    for (var i = 1; i < settings.server.geoIpLocators[data.geoLocator].countryCodeField.length; i++) {
      countryCode = countryCode[settings.server.geoIpLocators[data.geoLocator].countryCodeField[i]];
    }

    var language = getLanguageByCountryCode(countryCode);

    data.clientResponse.geoInfo = result;
    data.clientResponse.language = language;

    callback(null, data);

  });
}

//-------------------------------------------------------------------------------
// binaryRangeSearch - searches a number within a range array
//-------------------------------------------------------------------------------
function binaryRangeSearch(arr, searchProperty, number) {

  if (arr.length == 1) {
    return arr[0][resultProperty];
  }

  var left = 0;
  var right = arr.length - 1;

  var middle;
  while (left < right) {
    middle = mathjs.floor(left + (right - left) / 2);
    if (number <= arr[middle][searchProperty]) {
      right = middle;
    }
    else {
      left = middle + 1;
    }
  }

  return arr[left];
}

//-----------------------------------------------------------------------
// getDirectionByLanguage
//
// returns the direction (ltr/rtl) based on language
//-----------------------------------------------------------------------
module.exports.getDirectionByLanguage = getDirectionByLanguage;
function getDirectionByLanguage(languageCodeIso2) {

  var direction = settings.server.directionByLanguage[languageCodeIso2];

  if (direction) {
    return direction;
  }
  else {
    return settings.server.directionByLanguage["default"];
  }
}

//-----------------------------------------------------------------------
// getLanguageByCountryCode
//
// returns the default language based on country ISO2 code
//-----------------------------------------------------------------------
module.exports.getLanguageByCountryCode = getLanguageByCountryCode;
function getLanguageByCountryCode(countryCode) {

  var language = settings.server.languageByCountryCode[countryCode];

  if (language) {
    return language;
  }
  else {
    return settings.server.languageByCountryCode["default"];
  }
}

//-------------------------------------------------------------------------------------------------------------------------
// getSettings (client request)
//
// data: language (optional), defaultLanguage (optional) platform (optional), platformVersion (optional), appVersion (optional)
//
// returns general server settings for each client.
// Optionally return a serverPopup to request to upgrade
//-------------------------------------------------------------------------------------------------------------------------
module.exports.getSettings = function (req, res, next) {

  var data = req.body;

  data.clientResponse = {};

  var operations = [

    //Check to invoke geoInfo
    function (callback) {
      if (!data.language) {
        if (req.connection.remoteAddress) {
          data.geoLocator = 0;
          data.ip = req.connection.remoteAddress;
          getGeoInfo(data, callback);
        }
        else {
          data.language = data.defaultLanguage;
          callback(null, data);
        }
      }
      else {
        callback(null, data);
      }
    },

    //Check must update
    function (data, callback) {

      if (data.clientInfo && data.clientInfo.appVersion) {

        if (versionCompare(settings.server.versions.mustUpdate.minVersion, data.clientInfo.appVersion) === 1) {
          data.clientResponse = JSON.parse(JSON.stringify(settings.client));

          data.clientResponse.serverPopup = JSON.parse(JSON.stringify(settings.server.versions.mustUpdate.popup));

          if (data.clientResponse.serverPopup.title) {
            //Convert the text array to a simple string picking only the required language
            data.clientResponse.serverPopup.title = data.clientResponse.serverPopup.title[data.language];
          }
          if (data.clientResponse.serverPopup.message) {
            //Convert the text array to a simple string picking only the required language
            data.clientResponse.serverPopup.message = data.clientResponse.serverPopup.message[data.language];
          }

          for (var i = 0; i < data.clientResponse.serverPopup.buttons.length; i++) {
            if (data.clientResponse.serverPopup.buttons[i].text) {
              //Convert the text array to a simple string picking only the required language
              data.clientResponse.serverPopup.buttons[i].text = data.clientResponse.serverPopup.buttons[i].text[data.language];
            }
            if (data.clientResponse.serverPopup.buttons[i].link && data.clientResponse.serverPopup.buttons[i].link.indexOf("#storeLink#") > -1) {
              data.clientResponse.serverPopup.buttons[i].link = data.clientResponse.serverPopup.buttons[i].link.replace("#storeLink#", settings.server.platforms[data.clientInfo.platform].storeLink);
            }
          }
        }
      }

      if (!data.clientResponse.serverPopup) {
        data.clientResponse.settings = settings.client;
      }
      callback(null, data);
    },
  ];

  async.waterfall(operations, function (err, data) {
    if (!err) {
      res.send(200, data.clientResponse);
    }
    else {
      res.send(err.httpStatus, err);
    }
  })
}

//---------------------------------------------------------------------------------------------------
// XpProgress class
//
// Constructs the xp in a relational manner to be presented in a progress element
// addXP function:
// object can be either a session or a user - both should contain xp and rank as properties
//---------------------------------------------------------------------------------------------------
module.exports.XpProgress = XpProgress;
function XpProgress(xp, rank) {
  this.addition = 0;
  this.xp = xp;
  this.rank = rank;
  this.refresh();
}

XpProgress.prototype.addXp = function (object, action) {
  var xp = settings.server.xpCredits[action];
  if (xp) {

    object.xp += xp;
    var result = binaryRangeSearch(settings.server.rankByXp, "xp", object.xp);

    //update object (session, user)
    object.rank = result.rank;


    //update my progress
    this.addition += xp;
    this.xp += xp;

    if (result.rank > this.rank) {
      this.rankChanged = true;
      if (result.unlockFeature && result.unlockFeatureMessage) {
        this.unlockFeatureMessage = result.unlockFeatureMessage;
      }
      this.rank = result.rank
    }
    else {
      this.rankChanged = false;
    }

    this.refresh();

  }
};

XpProgress.prototype.refresh = function () {
  var xpForRank;
  if (this.rank - 2 >= 0) {
    xpForRank = settings.server.rankByXp[this.rank - 2].xp;
  }
  else {
    xpForRank = 0;
  }

  var xpForNextRank = settings.server.rankByXp[this.rank - 1].xp;
  var xpAchievedInRank = this.xp - xpForRank;
  var xpDiff = xpForNextRank - xpForRank;

  this.current = xpAchievedInRank;
  this.max = xpDiff;
};

//---------------------------------------------------------------------------------------------------
// versionCompare
//
// compares 2 software versions.
// returns:
// 1  if v1>v2
// -1 if v1<v2
// 0  if v1=v2
//---------------------------------------------------------------------------------------------------
module.exports.versionCompare = versionCompare;
function versionCompare(v1, v2, options) {
  var lexicographical = options && options.lexicographical,
    zeroExtend = options && options.zeroExtend,
    v1parts = v1.split('.'),
    v2parts = v2.split('.');

  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push("0");
    while (v2parts.length < v1parts.length) v2parts.push("0");
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);
  }

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length == i) {
      return 1;
    }

    if (v1parts[i] == v2parts[i]) {
      continue;
    }
    else if (v1parts[i] > v2parts[i]) {
      return 1;
    }
    else {
      return -1;
    }
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
}

//---------------------------------------------------------------------------------------------------
// add "contains" function to an array to check if an item exists in an array
//---------------------------------------------------------------------------------------------------
Array.prototype.contains = function (obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
};

//-------------------------------------------------------------------------------------------------------
// getWeekYear returns a string of current year and current week (e.g. 201541 - means year 2015 week 41
//-------------------------------------------------------------------------------------------------------
module.exports.getYearWeek = function () {

  var d = new Date();
  var thisYear = d.getFullYear();
  var startOfYear = new Date(thisYear, 0, 1);
  var week = Math.ceil((((d - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
  return "" + thisYear + "" + week;
};
