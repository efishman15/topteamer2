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
// upgradeDb
//
// data: <NA>
//--------------------------------------------------------------------------
module.exports.upgradeDb = function (req, res, next) {

  var token = req.headers.authorization;
  var data = req.body;

  var operations = [

    //getAdminSession
    function (callback) {
      data.token = token;
      sessionUtils.getAdminSession(data, callback);
    },

    //Run on all contests
    function (data, callback) {
      var contestsCollection = data.DbHelper.getCollection('Contests');
      contestsCollection.find({}, {}, function (err, contestsCursor) {
        contestsCursor.toArray(function (err, contests) {

          for (var i = 0; i < contests.length; i++) {
            fixLeaderboard(data, dalLeaderboads.getContestLeaderboard(contests[i]._id.toString()));
            fixLeaderboard(data, dalLeaderboads.getTeamLeaderboard(contests[i]._id.toString(), 0));
            fixLeaderboard(data, dalLeaderboads.getTeamLeaderboard(contests[i]._id.toString(), 1));

            fixContest(data, contests[i]);
          }

          fixLeaderboard(data, dalLeaderboads.getWeeklyLeaderboard());
          fixLeaderboard(data, new Leaderboard('topteamer:general'));

          callback(null, data)

        })
      });
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

function fixLeaderboard(data, leaderboard) {

  var options = {
    'withMemberData': true,
    'sortBy': 'rank',
    'pageSize': 1000
  };

  var usersCollection = data.DbHelper.getCollection('Users');

  leaderboard.leaders(0, options, function (leaders) {

    async.forEach(leaders, function(leader, callback) {
      usersCollection.findOne({
        'facebookUserId': leader.member
      }, {}, function (err, user) {
        if (!err && user) {
          leaderboard.removeMember(leader.member, function () {
            leaderboard.rankMember(user._id.toString(), leader.score, user.name + '|0|' + leader.member, function() {
              callback();
            });

          })
        }
      });
    });
  });
}

function fixContest(data, contest) {

  var contestsCollection = data.DbHelper.getCollection('Contests');

  var updateFields = {$set: {}};
  updateFields['$unset'] = {}

  if (!contest.creator.avatar) {
    updateFields['$set']['creator.avatar'] = {type: 0, id: contest.creator.facebookUserId};
    updateFields['$unset']['creator.facebookUserId'] = '';
  }

  if (!contest.leader.avatar) {
    updateFields['$set']['leader.avatar'] = {type: 0, id: contest.leader.facebookUserId};
    updateFields['$unset']['leader.facebookUserId'] = '';
  }

  if (contest.teams[0].leader && !contest.teams[0].leader.avatar) {
    updateFields['$set']['teams.0.leader.avatar'] = {type: 0, id: contest.teams[0].leader.facebookUserId};
    updateFields['$unset']['teams.0.leader.facebookUserId'] = '';
  }

  if (contest.teams[1].leader && !contest.teams[1].leader.avatar) {
    updateFields['$set']['leader.teams.1.avatar'] = {type: 0, id: contest.teams[1].leader.facebookUserId};
    updateFields['$unset']['leader.teams.1.facebookUserId'] = '';
  }

  contestsCollection.findAndModify({'_id': ObjectId(contest._id)}, {},
    updateFields, {w: 1, new: true}, function (err, contest) {
    });
}
