var _this = this;
var client_1 = require('./client');
var objects_1 = require('../objects/objects');
var emailRef = '?ref=shareEmail';
exports.getVariables = function (contest) {
    var client = client_1.Client.getInstance();
    var shareVariables = new objects_1.ShareVariables();
    shareVariables.shareImage = client.settings.general.baseUrl + client.settings.general.logoUrl;
    if (contest) {
        shareVariables.shareUrl = contest.link;
        shareVariables.shareSubject = client.translate('SHARE_SUBJECT_WITH_CONTEST', { name: contest.name.long });
        if (contest.myTeam === 0 || contest.myTeam === 1) {
            //I am playing for one of the teams
            shareVariables.shareBody = client.translate('SHARE_BODY_WITH_CONTEST_AND_TEAM', {
                team: contest.teams[contest.myTeam].name,
                url: shareVariables.shareUrl
            });
            shareVariables.shareBodyEmail = client.translate('SHARE_BODY_WITH_CONTEST_AND_TEAM', {
                team: contest.teams[contest.myTeam].name,
                url: shareVariables.shareUrl + emailRef
            });
            shareVariables.shareBodyNoUrl = client.translate('SHARE_BODY_NO_URL_WITH_CONTEST_AND_TEAM', {
                team: contest.teams[contest.myTeam].name,
                name: contest.name.long
            });
        }
        else {
            //I did not join this contest yet
            shareVariables.shareBody = client.translate('SHARE_BODY_WITH_CONTEST_NO_TEAM', {
                name: contest.name.long,
                url: shareVariables.shareUrl
            });
            shareVariables.shareBodyEmail = client.translate('SHARE_BODY_WITH_CONTEST_NO_TEAM', {
                name: contest.name.long,
                url: shareVariables.shareUrl + emailRef
            });
            shareVariables.shareBodyNoUrl = client.translate('SHARE_BODY_NO_URL_WITH_CONTEST_NO_TEAM', {
                name: contest.name.long
            });
        }
    }
    else {
        shareVariables.shareUrl = client.settings.general.downloadUrl[client.user.settings.language];
        shareVariables.shareSubject = client.translate('SHARE_SUBJECT');
        shareVariables.shareBody = client.translate('SHARE_BODY', { url: shareVariables.shareUrl });
        shareVariables.shareBodyEmail = client.translate('SHARE_BODY', { url: shareVariables.shareUrl + emailRef });
        shareVariables.shareBodyNoUrl = client.translate('SHARE_BODY_NO_URL') + ' ' + client.translate('GAME_NAME');
    }
    return shareVariables;
};
exports.mobileDiscoverSharingApps = function () {
    var client = client_1.Client.getInstance();
    var shareVariables = _this.getVariables();
    var promises = [];
    client.settings.share.mobile.discoverApps.forEach(function (shareApp) {
        promises.push(_this.mobileDiscoverApp(client, shareApp, shareVariables));
    });
    Promise.all(promises).then(function () {
        for (var i = 0; i < client.settings.share.mobile.discoverApps.length; i++) {
            if (client.settings.share.mobile.discoverApps[i].package[client.clientInfo.platform].installed && client.shareApps.length < client.settings.share.mobile.maxApps) {
                client.shareApps.push(new objects_1.ClientShareApp(client.settings.share.mobile.discoverApps[i].name, client.settings.share.mobile.discoverApps[i].title, client.settings.share.mobile.discoverApps[i].image));
            }
            else if (client.shareApps.length === client.settings.share.mobile.maxApps) {
                break;
            }
        }
        if (client.shareApps.length < client.settings.share.mobile.maxApps) {
            for (var i = 0; i < client.settings.share.mobile.extraApps.length; i++) {
                if (client.shareApps.length < client.settings.share.mobile.maxApps) {
                    client.shareApps.push(client.settings.share.mobile.extraApps[i]);
                }
                else {
                    break;
                }
            }
        }
    });
};
exports.mobileDiscoverApp = function (client, shareApp, shareVariables) {
    return new Promise(function (resolve, reject) {
        window.plugins.socialsharing.canShareVia(shareApp.package[client.clientInfo.platform].name, shareVariables.shareBodyNoUrl, shareVariables.shareSubject, shareVariables.shareImage, shareVariables.shareUrl, function (result) {
            if (result === 'OK' && client.shareApps.length < client.settings.share.mobile.maxApps) {
                //Not inserting directly to client.shareApps because it might be inserted not in the same
                //order (async) of apps as was determined by the server
                shareApp.package[client.clientInfo.platform].installed = true;
            }
            resolve();
        }, function () {
            resolve();
        });
    });
};
exports.mobileShare = function (appName, contest) {
    var shareVariables = _this.getVariables(contest);
    switch (appName) {
        case 'whatsapp':
            window.plugins.socialsharing.shareViaWhatsApp(shareVariables.shareBodyNoUrl, shareVariables.shareImage, shareVariables.shareUrl, function () {
            }, function (err) {
                window.myLogError('WhatsApp Share', err);
            });
            break;
        case 'facebook':
            window.plugins.socialsharing.shareViaFacebook(shareVariables.shareBodyNoUrl, shareVariables.shareImage, shareVariables.shareUrl, function () {
            }, function (err) {
                window.myLogError('Facebook Share', err);
            });
            break;
        case 'instagram':
            window.plugins.socialsharing.shareViaInstagram(shareVariables.shareBody, shareVariables.shareImage, function () {
            }, function (err) {
                window.myLogError('Instagram Share', err);
            });
            break;
        case 'twitter':
            window.plugins.socialsharing.shareViaTwitter(shareVariables.shareBodyNoUrl, shareVariables.shareImage, shareVariables.shareUrl, function () {
            }, function (err) {
                window.myLogError('Twitter Share', err);
            });
            break;
        case 'sms':
            window.plugins.socialsharing.shareViaSMS({ 'message': shareVariables.shareBody }, null, //Phone numbers - user will type
            function () {
            }, function (err) {
                window.myLogError('SMS Share', err);
            });
            break;
        case 'email':
            window.plugins.socialsharing.shareViaEmail(shareVariables.shareBodyEmail, shareVariables.shareSubject, null, //To
            null, //Cc
            null, //Bcc
            shareVariables.shareImage, function () {
            }, function (err) {
                window.myLogError('Email Share', err);
            });
            break;
        default:
            var options = {};
            options.message = shareVariables.shareBodyNoUrl;
            options.subject = shareVariables.shareSubject;
            options.files = [shareVariables.shareImage];
            options.url = shareVariables.shareUrl;
            window.plugins.socialsharing.shareWithOptions(options, function () {
            }, function (err) {
                window.myLogError('General Mobile Share', err);
            });
            break;
    }
};
//# sourceMappingURL=share.js.map