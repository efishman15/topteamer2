import {Client} from './client';
import {SharePage} from '../pages/share/share';

var emailRef = '?ref=shareEmail';

function adjustUrl(url) {

  var client = Client.getInstance();

  if (client.user.clientInfo.mobile) {
    return encodeURIComponent(url);
  }
  else {
    return url;
  }
}

export let getVariables = (contest) => {

  var client = Client.getInstance();
  var shareVariables = {};

  if (contest) {
    shareVariables.shareUrl = contest.link;
    shareVariables.shareSubject = client.translate('SHARE_SUBJECT_WITH_CONTEST', {name: contest.name});

    if (contest.myTeam === 0 || contest.myTeam === 1) {
      shareVariables.shareBody = client.translate('SHARE_BODY_WITH_CONTEST', {
        team: contest.teams[contest.myTeam].name,
        url: shareVariables.shareUrl
      });
      shareVariables.shareBodyEmail = client.translate('SHARE_BODY_WITH_CONTEST', {
        team: contest.teams[contest.myTeam].name,
        url: shareVariables.shareUrl + emailRef
      });
      shareVariables.shareBodyNoUrl = client.translate('SHARE_BODY_NO_URL_WITH_CONTEST', {
        team: contest.teams[contest.myTeam].name,
        name: contest.name
      });
    }
    else {
      shareVariables.shareBody = client.translate('SHARE_BODY', {url: shareVariables.shareUrl});
      shareVariables.shareBodyEmail = client.translate('SHARE_BODY', {url: shareVariables.shareUrl + emailRef});
      shareVariables.shareBodyNoUrl = client.translate('SHARE_BODY_NO_URL');
    }
  }
  else {
    shareVariables.shareUrl = adjustUrl(client.settings.general.downloadUrl[client.user.settings.language]);
    shareVariables.shareSubject = client.translate('SHARE_SUBJECT');
    shareVariables.shareBody = client.translate('SHARE_BODY', {url: shareVariables.shareUrl});
    shareVariables.shareBodyEmail = client.translate('SHARE_BODY', {url: shareVariables.shareUrl + emailRef});
    shareVariables.shareBodyNoUrl = client.translate('SHARE_BODY_NO_URL') + ' - "' + client.translate('WHO_IS_SMARTER_QUESTION') + '"';
  }

  return shareVariables;

}

export let mobileShare = (contest) => {

  var client = Client.getInstance();
  var shareVariables = this.getVariables(contest);

  $cordovaSocialSharing.share(shareVariables.shareBodyNoUrl,
    shareVariables.shareSubject,
    client.settings.general.baseUrl + client.settings.general.logoUrl,
    shareVariables.shareUrl
  );
}

export let share = (contest) => {

  var client = Client.getInstance();
  if (client.user.clientInfo.mobile) {
    this.mobileShare(contest);
  }
  else {
    client.nav.push(SharePage);
  }

  //TODO: flurry + source

}