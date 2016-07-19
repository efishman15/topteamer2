var _this = this;
var client_1 = require('./client');
var ionic_angular_1 = require('ionic-angular');
//------------------------------------------------------
//-- alert
//------------------------------------------------------
exports.alert = function (message, buttons) {
    return new Promise(function (resolve, reject) {
        var client = client_1.Client.getInstance();
        var alert;
        var title;
        var messageText;
        if (message.type) {
            if (!message.additionalInfo) {
                message.additionalInfo = {};
            }
            title = client.translate(message.type + '_TITLE', message.additionalInfo);
            messageText = client.translate(message.type + '_MESSAGE', message.additionalInfo);
        }
        else {
            messageText = message;
        }
        if (!buttons) {
            buttons = [
                {
                    text: client.translate('OK'),
                    role: 'cancel',
                    handler: resolve
                }
            ];
        }
        alert = ionic_angular_1.Alert.create({
            message: messageText,
            buttons: buttons
        });
        if (title) {
            alert.setTitle('<span class="app-alert-title-' + client.currentLanguage.direction + '">' + title + '</span>');
        }
        client.nav.present(alert);
    });
};
//------------------------------------------------------
//-- confirm
//------------------------------------------------------
exports.confirm = function (title, message, params) {
    return new Promise(function (resolve, reject) {
        var client = client_1.Client.getInstance();
        var alignedTitle = '<span class="app-alert-title-' + client.currentLanguage.direction + '">' + client.translate(title, params) + '</span>';
        var alert = ionic_angular_1.Alert.create({
            title: alignedTitle,
            message: client.translate(message, params),
            buttons: [
                {
                    text: client.translate('OK'),
                    handler: resolve
                },
                {
                    text: client.translate('CANCEL'),
                    handler: reject
                }
            ]
        });
        client.nav.present(alert);
    });
};
//------------------------------------------------------
//-- confirmExitApp
//------------------------------------------------------
exports.confirmExitApp = function () {
    var client = client_1.Client.getInstance();
    return _this.confirm('EXIT_APP_TITLE', 'EXIT_APP_MESSAGE', null).then(function () {
        window.FlurryAgent.endSession();
        window.navigator['app'].exitApp();
    });
};
//# sourceMappingURL=alert.js.map