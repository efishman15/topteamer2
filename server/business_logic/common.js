var path = require('path');
var util = require('util');
var generalUtils = require(path.resolve(__dirname, '../utils/general'));

//----------------------------------------------------
// Private functions
//
//----------------------------------------------------

//----------------------------------------------------
// getContestTitle
//
//----------------------------------------------------
function getContestTitle(contest) {

  var contestTitle = generalUtils.settings.server.facebook.openGraphStories.text[contest.language].contestTitle.format(
    {
      'team0': contest.teams[0].name,
      'team1': contest.teams[1].name,
      'subject': contest.subject
    });

  return contestTitle;
}

//----------------------------------------------------
// getTeamTitle
//
//----------------------------------------------------
function getTeamTitle(contest, team) {


}

//----------------------------------------------------
// getOtherTeamDescription
//
//----------------------------------------------------
function getTeamDescription(contest, myTeam) {

  var propertyName;
  if (contest.teams[myTeam].score <= contest.teams[1 - myTeam].score) {
    propertyName = 'teamDescriptionWinning';
  }
  else {
    propertyName = 'teamDescriptionLosing';
  }

  var description = generalUtils.settings.server.facebook.openGraphStories.text[contest.language][propertyName];
  description = description.format({
    'name': contest.teams[1 - myTeam].name,
    'subject': contest.subject
  });

  return description;
}

//---------------------------------------------------------------------------------
// addXp
//
// data: session
// output: data.xpProgress object created/modified ready to be sent to the client
//---------------------------------------------------------------------------------
module.exports.addXp = function (data, action) {

  if (!data.xpProgress) {
    data.xpProgress = new generalUtils.XpProgress(data.session.xp, data.session.rank);
  }

  data.xpProgress.addXp(data.session, action);

}

//---------------------------------------------------------------------
// get Open graph object
//---------------------------------------------------------------------
module.exports.getOpenGraphObject = getOpenGraphObject;
function getOpenGraphObject(objectType, objectData, isCrawlerMode, isMobile) {

  var facebookObject = {};

  if (!isCrawlerMode && !isMobile) {
    //Web mode - post will have a single "object" property like this: {"team" : "some Url"}
    facebookObject[objectType] = objectData.url;
    return {'facebookObject': facebookObject};
  }

  var redirectUrl;
  facebookObject = JSON.parse(JSON.stringify(generalUtils.settings.server.facebook.openGraphStories.objects[objectType]));

  switch (objectType) {
    case 'contest':
    case 'contestLeader':
      facebookObject['og:title'] = getContestTitle(objectData.contest);
      facebookObject['og:url'] = facebookObject['og:url'].format({'contestId': objectData.contest._id.toString()});
      facebookObject['og:description'] = generalUtils.settings.server.facebook.openGraphStories.text[objectData.contest.language].gameDescription;
      redirectUrl = objectData.contest.link;
      break;
    case 'team':
    case 'teamLeader':
      facebookObject['og:title'] = generalUtils.settings.server.facebook.openGraphStories.text[objectData.contest.language].teamTitle.format({'name': objectData.contest.teams[objectData.team].name});
      facebookObject['og:description'] = getTeamDescription(objectData.contest, objectData.team);
      facebookObject['og:url'] = facebookObject['og:url'].format({
        'contestId': objectData.contest._id.toString(),
        'teamId': objectData.team
      });
      redirectUrl = objectData.contest.link;
      break;
    case 'profile':
      facebookObject['og:url'] = facebookObject['og:url'].format({
        'facebookUserId': objectData.facebookUserId,
        'language': objectData.language
      });
      facebookObject['og:image'] = facebookObject['og:image'].format({'facebookUserId': objectData.facebookUserId});
      facebookObject['og:description'] = generalUtils.settings.server.facebook.openGraphStories.text[objectData.language].gameDescription;
      redirectUrl = generalUtils.settings.client.general.downloadUrl[objectData.language];
      break;
  }

  if (isCrawlerMode) {
    facebookObject['fb:app_id'] = generalUtils.settings.server.facebook.appId;
    facebookObject['redirectUrl'] = redirectUrl;
  }

  return {'facebookObject': facebookObject};

};

