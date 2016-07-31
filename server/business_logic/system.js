var path = require('path');
var exceptions = require(path.resolve(__dirname, '../utils/exceptions'));
var generalUtils = require(path.resolve(__dirname, '../utils/general'));
var logger = require(path.resolve(__dirname, '../utils/logger'));
var async = require('async');
var sessionUtils = require(path.resolve(__dirname, './session'));
var dalDb = require(path.resolve(__dirname, '../dal/dalDb'));
var dalLeaderboads = require(path.resolve(__dirname, '../dal/dalLeaderboards'));
var cache = require(path.resolve(__dirname, '../utils/cache'));
var Leaderboard = require('agoragames-leaderboard');
var ObjectId = require('mongodb').ObjectID;

//--------------------------------------------------------------------------
// clearCache
//
// data: <NA>
//--------------------------------------------------------------------------
module.exports.clearCache = function (req, res, next) {

  var token = req.headers.authorization;
  var data = req.body;

  var operations = [

    //getAdminSession
    function (callback) {
      data.token = token;
      sessionUtils.getAdminSession(data, callback);
    },

    //Reload settings from database
    function (data, callback) {
      cache.clear();
      data.closeConnection = true;
      dalDb.loadSettings(data, callback);
    },

    //Inject the settings back to memory
    function (data, callback) {
      generalUtils.injectSettings(data.settings);
      logger.server.info({'user': data.session.name}, 'cache cleared!');
      callback(null, data);
    }
  ];

  async.waterfall(operations, function (err) {
    if (!err) {
      res.json(data.settings.client);
    }
    else {
      res.send(err.httpStatus, err);
    }
  });
};

//--------------------------------------------------------------------------
// restart
//
// data: <NA>
//--------------------------------------------------------------------------
module.exports.restart = function (req, res, next) {

  var token = req.headers.authorization;
  var data = req.body;
  data.token = token;
  data.closeConnection = true;

  sessionUtils.getAdminSession(data, function (err, data) {

    if (err) {
      res.send(err.httpStatus, err);
      return;
    }

    res.json(generalUtils.okResponse);
    res.end();

    logger.server.info({'user': data.session.name}, 'Restarting server per admins request');

    //Forever module will take care of restarting the process again
    setTimeout(function () {
      process.exit(1);
    }, 3000);
  });
};

//--------------------------------------------------------------------------
// showLog
//
// data: <NA>
//--------------------------------------------------------------------------
module.exports.showLog = function (req, res, next) {

  var data = {token: req.params.token};

  if (!req.params.type) {
    exceptions.ServerResponseException(res, 'type not supplied', null, 'warn', 424);
    return;
  }

  if (req.params.type !== 'server' && req.params.type !== 'client') {
    exceptions.ServerResponseException(res, 'type must be server/client', null, 'warn', 424);
    return;
  }

  data.closeConnection = true;

  sessionUtils.getAdminSession(data, function (err, data) {

    if (err) {
      res.send(err.httpStatus, err);
      return;
    }

    var logFile;
    var fileName;
    if (req.params.type === 'server') {
      logFile = path.resolve(__dirname, '../logs/server.log');
      flieName = 'server.log';
    }
    else {
      logFile = path.resolve(__dirname, '../logs/client/client.log');
      flieName = 'client.log';
    }

    res.download(logFile, fileName);

  });
}

//--------------------------------------------------------------------------
// fixAvatars
//
// data: <NA>
//--------------------------------------------------------------------------
module.exports.fixAvatars = function (req, res, next) {

  var token = req.headers.authorization;
  var data = req.body;

  var operations = [

    //getAdminSession
    function (callback) {
      data.token = token;
      sessionUtils.getAdminSession(data, callback);
    },

    //Reload settings from database
    function (data, callback) {
      var contestsCollection = data.DbHelper.getCollection('Contests');
      contestsCollection.find({}, {}, function (err, contestsCursor) {
        contestsCursor.toArray(function (err, contests) {
          data.contests = contests;
          for (var i = 0; i < contests.length; i++) {
            fixLeaderboard(dalLeaderboads.getContestLeaderboard(contests[i]._id));
            fixLeaderboard(dalLeaderboads.getTeamLeaderboard(contests[i]._id,0));
            fixLeaderboard(dalLeaderboads.getTeamLeaderboard(contests[i]._id,1));

            fixContest(data, contests[i]);
          }

          fixLeaderboard(dalLeaderboads.getWeeklyLeaderboard());
          fixLeaderboard(new Leaderboard('topteamer:general'));

          callback(null, data)

        })});
    }

  ];

  async.waterfall(operations, function (err) {
    if (!err) {
      res.json(generalUtils.okResponse);
    }
    else {
      res.send(err.httpStatus, err);
    }
  });

}

function fixLeaderboard(leaderboard) {

  var i = 0;
  var options = {
    'withMemberData': true,
    'sortBy': 'rank',
    'pageSize': 200
  };

  leaderboard.leaders(0, options, function (leaders) {
    for (var j=0; j < leaders.length; j++) {
      var memberData = leaders[j].member_data.split('|');
      leaderboard.updateMemberData(leaders[j].member, memberData[memberData.length-1], function () {
      });
    }
  });
}

function fixContest(data, contest) {

  var contestsCollection = data.DbHelper.getCollection('Contests');

  var updateFields = {$set: {}};
  updateFields['$unset'] = {}

  if (contest.creator.avatar) {
    updateFields['$set']['creator.facebookUserId'] = getFacebookUserIdFromAvatar(contest.creator.avatar);
    updateFields['$unset']['creator.avatar'] = '';
  }

  if (contest.leader.avatar) {
    updateFields['$set']['leader.facebookUserId'] = getFacebookUserIdFromAvatar(contest.leader.avatar);
    updateFields['$unset']['leader.avatar'] = '';
  }

  if (contest.leader.userId) {
    updateFields['$set']['leader.id'] = contest.leader.userId;
    updateFields['$unset']['leader.userId'] = '';
  }

  if (contest.teams[0].leader) {
    updateFields['$set']['teams.0.leader.id'] = contest.teams[0].leader.userId;
    updateFields['$unset']['teams.0.leader.userId'] = '';
    if (contest.teams[0].leader.avatar) {
      updateFields['$set']['teams.0.leader.facebookUserId'] = getFacebookUserIdFromAvatar(contest.teams[0].leader.avatar);
      updateFields['$unset']['teams.0.leader.avatar'] = '';
    }
  }

  if (contest.teams[1].leader) {
    updateFields['$set']['teams.1.leader.id'] = contest.teams[1].leader.userId;
    updateFields['$unset']['teams.1.leader.userId'] = '';
    if (contest.teams[1].leader.avatar) {
      updateFields['$set']['teams.1.leader.facebookUserId'] = getFacebookUserIdFromAvatar(contest.teams[1].leader.avatar);
      updateFields['$unset']['teams.1.leader.avatar'] = '';
    }
  }

  contestsCollection.findAndModify({'_id': ObjectId(contest._id)}, {},
    updateFields, {w: 1, new: true}, function (err, contest) {
  });
}

function getFacebookUserIdFromAvatar(avatar) {
  return avatar.split('/')[3];
}
