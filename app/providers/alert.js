var _this = this;
var client_1 = require('./client');
var ionic_angular_1 = require('ionic-angular');
//------------------------------------------------------
//-- alert
//------------------------------------------------------
exports.alert = function (error) { return new Promise(function (resolve, reject) {
    var client = client_1.Client.getInstance();
    var alert;
    var title;
    var message;
    if (error.type) {
        if (!error.additionalInfo) {
            error.additionalInfo = {};
        }
        title = client.translate(error.type + '_TITLE');
        message = client.translate(error.type + '_MESSAGE', error.additionalInfo);
    }
    else {
        message = error;
    }
    alert = ionic_angular_1.Alert.create({
        cssClass: client.currentLanguage.direction,
        message: message,
        buttons: [
            {
                text: client.translate('OK'),
                role: 'cancel',
                handler: resolve
            }
        ]
    });
    if (title) {
        alert.setTitle(title);
    }
    client.nav.present(alert);
}); };
//------------------------------------------------------
//-- confirm
//------------------------------------------------------
exports.confirm = function (title, message, params) { return new Promise(function (resolve, reject) {
    var client = client_1.Client.getInstance();
    var alert = ionic_angular_1.Alert.create({
        title: client.translate(title, params),
        message: client.translate(message, params),
        cssClass: client.currentLanguage.direction,
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
}); };
//------------------------------------------------------
//-- confirmExitApp
//------------------------------------------------------
exports.confirmExitApp = function () {
    var client = client_1.Client.getInstance();
    return _this.confirm('EXIT_APP_TITLE', 'EXIT_APP_MESSAGE', null).then(function () {
        FlurryAgent.endSession();
        client.platform.exitApp();
    });
};
