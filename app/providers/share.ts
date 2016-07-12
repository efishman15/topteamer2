import {Client} from './client';
import {ShareVariables,ClientShareApp,ClientShareDiscoverApp,Contest} from '../objects/objects';

const EMAIL_REF:string = '?ref=shareEmail';

export let getVariables = (contest?:Contest, isNewContest? : boolean) => {

  var client = Client.getInstance();
  let shareVariables : ShareVariables = new ShareVariables();
  let subjectField : string;
  let bodyField : string;

  var params = {};

  shareVariables.shareImage = client.settings.general.baseUrl + client.settings.general.logoUrl;

  if (contest) {

    params['team0'] = contest.teams[0].name;
    params['team1'] = contest.teams[1].name;

    shareVariables.shareUrl = contest.link;

    if (isNewContest) {
      subjectField = 'SHARE_SUBJECT_NEW_CONTEST';
      bodyField = 'SHARE_BODY_NEW_CONTEST';
    }
    else if (contest.myTeam === 0 || contest.myTeam === 1) {
      params['myTeam'] = contest.teams[contest.myTeam].name;
      params['otherTeam'] = contest.teams[1-contest.myTeam].name;
      subjectField = 'SHARE_SUBJECT_CONTEST_JOINED';
      bodyField = 'SHARE_BODY_CONTEST_JOINED';
    }
    else {
      subjectField = 'SHARE_SUBJECT_CONTEST_NOT_JOINED';
      bodyField = 'SHARE_BODY_CONTEST_NOT_JOINED';
    }
  }
  else {
    shareVariables.shareUrl = client.settings.general.downloadUrl[client.currentLanguage.value];
    subjectField = 'SHARE_SUBJECT_GENERAL';
    bodyField = 'SHARE_BODY_GENERAL';
  }

  shareVariables.shareSubject = client.translate(subjectField, params);
  shareVariables.shareBodyNoUrl = client.translate(bodyField, params);
  shareVariables.shareBody = shareVariables.shareBodyNoUrl + ' ' + shareVariables.shareUrl;
  shareVariables.shareBodyEmail = shareVariables.shareBody + EMAIL_REF;

  return shareVariables;
}

export let mobileDiscoverSharingApps = () => {

  var client = Client.getInstance();
  let shareVariables:ShareVariables = this.getVariables();

  var promises = [];
  client.settings.share.mobile.discoverApps.forEach((shareApp:ClientShareDiscoverApp) => {
    promises.push(this.mobileDiscoverApp(client, shareApp, shareVariables));
  });

  Promise.all(promises).then(() => {

    for (let i:number = 0; i < client.settings.share.mobile.discoverApps.length; i++) {
      if (client.settings.share.mobile.discoverApps[i].package[client.clientInfo.platform].installed && client.shareApps.length < client.settings.share.mobile.maxApps) {
        client.shareApps.push(new ClientShareApp(client.settings.share.mobile.discoverApps[i].name, client.settings.share.mobile.discoverApps[i].title, client.settings.share.mobile.discoverApps[i].image));
      }
      else if (client.shareApps.length === client.settings.share.mobile.maxApps) {
        break;
      }
    }

    if (client.shareApps.length < client.settings.share.mobile.maxApps) {
      for (let i:number = 0; i < client.settings.share.mobile.extraApps.length; i++) {
        if (client.shareApps.length < client.settings.share.mobile.maxApps) {
          client.shareApps.push(client.settings.share.mobile.extraApps[i])
        }
        else {
          break;
        }
      }
    }
  });
}

export let mobileDiscoverApp = (client: any, shareApp:ClientShareDiscoverApp, shareVariables:ShareVariables) => {

  return new Promise((resolve:any, reject:any) => {

    window.plugins.socialsharing.canShareVia(shareApp.package[client.clientInfo.platform].name, shareVariables.shareBodyNoUrl,
      shareVariables.shareSubject,
      shareVariables.shareImage,
      shareVariables.shareUrl,
      (result) => {
        if (result === 'OK' && client.shareApps.length < client.settings.share.mobile.maxApps) {
          //Not inserting directly to client.shareApps because it might be inserted not in the same
          //order (async) of apps as was determined by the server
          shareApp.package[client.clientInfo.platform].installed = true;
        }
        resolve();
      },
      () => {
        resolve();
      }
    );
  });
}

export let mobileShare = (appName?:string, contest?:Contest, isNewContest?: boolean) => {

  let shareVariables:ShareVariables = this.getVariables(contest, isNewContest);
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
      window.plugins.socialsharing.shareViaInstagram(shareVariables.shareBody,
        shareVariables.shareImage,
        () => {
        },
        (err) => {
          window.myLogError('Instagram Share', err);
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
          window.myLogError('Twitter Share', err);
        }
      )
      break;
    case 'sms':
      window.plugins.socialsharing.shareViaSMS({'message': shareVariables.shareBody},
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
          window.myLogError('Email Share', err);
        }
      )
      break;

    default:
      let options:any = {};
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
