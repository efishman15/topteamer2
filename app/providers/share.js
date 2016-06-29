var _this = this;
var client_1 = require('./client');
var objects_1 = require('../objects/objects');
var emailRef = '?ref=shareEmail';
exports.getVariables = function (contest) {
    var client = client_1.Client.getInstance();
    var shareVariables = new objects_1.ShareVariables();
    if (contest) {
        shareVariables.shareUrl = contest.link;
        shareVariables.shareSubject = client.translate('SHARE_SUBJECT_WITH_CONTEST', { name: contest.name.long });
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
            shareVariables.shareBody = client.translate('SHARE_BODY', { url: shareVariables.shareUrl });
            shareVariables.shareBodyEmail = client.translate('SHARE_BODY', { url: shareVariables.shareUrl + emailRef });
            shareVariables.shareBodyNoUrl = client.translate('SHARE_BODY_NO_URL');
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
exports.mobileShare = function (contest) {
    var client = client_1.Client.getInstance();
    var shareVariables = _this.getVariables(contest);
    client.showLoader();
    window.plugins.socialsharing.share(shareVariables.shareBodyNoUrl, shareVariables.shareSubject, client.settings.general.baseUrl + client.settings.general.logoUrl, shareVariables.shareUrl, function () {
        client.hideLoader();
    }, function (result) {
        client.hideLoader();
        window.myLogError('Mobile Share', JSON.stringify(result));
    });
};
exports.share = function (source, contest) {
    var client = client_1.Client.getInstance();
    if (contest) {
        client.logEvent('share/' + source, { 'contestId': contest._id });
    }
    else {
        client.logEvent('share/' + source);
    }
    if (client.user.clientInfo.mobile) {
        _this.mobileShare(contest);
    }
    else {
        client.openPage('SharePage', { 'contest': contest });
    }
};
//# sourceMappingURL=share.js.map