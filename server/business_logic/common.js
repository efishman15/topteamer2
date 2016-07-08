var path = require('path');
var util = require('util');
var generalUtils = require(path.resolve(__dirname,'../utils/general'));

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

  var facebookObject;

  if (!isCrawlerMode && !isMobile) {
    //Web mode - post will have a single "object" property like this: {"team" : "some Url"}
    facebookObject = {};
    facebookObject[objectType] = objectData.url;
    return facebookObject;
  }

  var redirectUrl;
  facebookObject  = JSON.parse(JSON.stringify(generalUtils.settings.server.facebook.openGraphObjects[objectType]));
  facebookObject['og:description'] = generalUtils.settings.server.text[objectData.contest.language].gameDescription;

  switch (objectType) {
    case 'contest':
    case 'contestLeader':
      facebookObject['og:title'] = getContestName(objectData.contest);
      facebookObject['og:url'] = facebookObject['og:url'].format({'contestId': objectData.contest._id.toString()});
      redirectUrl = objectData.contest.link;
      break;
    case 'team':
    case 'teamLeader':
      facebookObject['og:title'] = util.format(generalUtils.settings.server.text[objectData.contest.language].teamTitle, objectData.contest.teams[objectData.team].name, getContestName(objectData.contest)),
      facebookObject['og:url'] = facebookObject['og:url'].format({'contestId': objectData.contest._id.toString(), 'teamId' : objectData.team});
      redirectUrl = objectData.contest.link;
      break;
    case 'profile':
      facebookObject['og:url'] = facebookObject['og:url'].format({'facebookUserId': objectData.facebookUserId, 'language' : objectData.language});
      facebookObject['og:image'] = facebookObject['og:image'].format({'facebookUserId': objectData.facebookUserId});
      redirectUrl = generalUtils.settings.client.general.downloadUrl[objectData.language];
      break;
  }

  if (isCrawlerMode) {
    facebookObject['fb:app_id'] = generalUtils.settings.server.facebook.appId;
    facebookObject['redirectUrl'] = redirectUrl;
  }

  return facebookObject;

};

//----------------------------------------------------
// getContestName
//
//----------------------------------------------------
module.exports.getContestName = getContestName;
function getContestName(contest) {

  var contestName = generalUtils.translate(contest.language, 'CONTEST_NAME_LONG',
    {
      'team0': contest.teams[0].name,
      'team1': contest.teams[1].name,
      'type': contest.subject
    });

  return contestName;
}
