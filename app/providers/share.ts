import {Client} from './client';
import {ShareVariables,ClientShareApp,Contest} from '../objects/objects';

var emailRef = '?ref=shareEmail';

export let getVariables = (contest? : Contest) => {

  var client = Client.getInstance();
  var shareVariables = new ShareVariables();

  shareVariables.shareImage = client.settings.general.baseUrl + client.settings.general.logoUrl;

  if (contest) {
    shareVariables.shareUrl = contest.link;
    shareVariables.shareSubject = client.translate('SHARE_SUBJECT_WITH_CONTEST', {name: contest.name.long});

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
        name: contest.name.long
      });
    }
    else {
      shareVariables.shareBody = client.translate('SHARE_BODY', {url: shareVariables.shareUrl});
      shareVariables.shareBodyEmail = client.translate('SHARE_BODY', {url: shareVariables.shareUrl + emailRef});
      shareVariables.shareBodyNoUrl = client.translate('SHARE_BODY_NO_URL');
    }
  }
  else {
    shareVariables.shareUrl = client.settings.general.downloadUrl[client.user.settings.language];
    shareVariables.shareSubject = client.translate('SHARE_SUBJECT');
    shareVariables.shareBody = client.translate('SHARE_BODY', {url: shareVariables.shareUrl});
    shareVariables.shareBodyEmail = client.translate('SHARE_BODY', {url: shareVariables.shareUrl + emailRef});
    shareVariables.shareBodyNoUrl = client.translate('SHARE_BODY_NO_URL') + ' ' + client.translate('GAME_NAME');
  }

  return shareVariables;

}

export let mobileDiscoverSharingOptions = () => {

  var client = Client.getInstance();
  client.shareApps = JSON.parse(JSON.stringify(client.settings.share.mobile.apps));
  let shareVariables : ShareVariables = this.getVariables();
  client.shareApps.forEach((shareApp:ClientShareApp) => {
    if (shareApp.discover) {
      window.plugins.socialsharing.canShareVia(shareApp.packages[client.clientInfo.platform], shareVariables.shareBodyNoUrl,
        shareVariables.shareSubject,
        client.settings.general.baseUrl + client.settings.general.logoUrl,
        shareVariables.shareUrl,
        (result) => {
          if (result === 'OK') {
            shareApp.installed = true;
          }
        },
        (err) => {
          window.myLogError('mobileDiscoverSharingOptions', err);
        }
      );
    }
  });
}

export let mobileShare = (appName?: string, contest?: Contest) => {

  var client = Client.getInstance();
  let shareVariables : ShareVariables = this.getVariables(contest);
  switch (appName) {
    case 'whatsapp':
      window.plugins.socialsharing.shareViaWhatsApp(shareVariables.shareBodyNoUrl,
        shareVariables.shareImage,
        shareVariables.shareUrl,
        () => {
        },
        (err) => {
          window.myLogError('WhatsApp Share', err);
        }
      )
      break;
    case 'facebook':
      window.plugins.socialsharing.shareViaFacebook(shareVariables.shareBodyNoUrl,
        shareVariables.shareImage,
        shareVariables.shareUrl,
        () => {
        },
        (err) => {
          window.myLogError('Facebook Share', err);
        }
      )
      break;
    case 'instagram':
      window.plugins.socialsharing.shareViaTwitter(shareVariables.shareBodyNoUrl,
        shareVariables.shareImage,
        shareVariables.shareUrl,
        () => {
        },
        (err) => {
          window.myLogError('Facebook Share', err);
        }
      )
      break;
    case 'twitter':
      window.plugins.socialsharing.shareViaTwitter(shareVariables.shareBodyNoUrl,
        shareVariables.shareImage,
        shareVariables.shareUrl,
        () => {
        },
        (err) => {
          window.myLogError('Facebook Share', err);
        }
      )
      break;
    case 'sms':
      window.plugins.socialsharing.shareViaSMS({'message': shareVariables.shareBodyNoUrl},
        null, //Phone numbers - user will type
        () => {
        },
        (err) => {
          window.myLogError('SMS Share', err);
        }
      )
      break;
    case 'email':
      window.plugins.socialsharing.shareViaEmail(shareVariables.shareBodyEmail,
        shareVariables.shareSubject,
        null, //To
        null, //Cc
        null, //Bcc
        shareVariables.shareImage,
        () => {
        },
        (err) => {
          window.myLogError('SMS Share', err);
        }
      )
      break;

    default:
      let options : any = {};
      options.message = shareVariables.shareBodyNoUrl;
      options.subject = shareVariables.shareSubject;
      options.files = [shareVariables.shareImage];
      options.url = shareVariables.shareUrl;

      window.plugins.socialsharing.shareWithOptions(options,
        () => {
        },
        (err) => {
          window.myLogError('General Mobile Share', err);
        }
      )
      break;

    }
}
