var _this = this;
var client_1 = require('./client');
//------------------------------------------------------
//-- alert
//------------------------------------------------------
exports.alert = function (error) {
    var client = client_1.Client.getInstance();
    if (error) {
        if (error.type) {
            if (!error.additionalInfo) {
                error.additionalInfo = {};
            }
            return client.popup.alert({
                'cssClass': client.currentLanguage.direction,
                'title': client.translate(error.type + '_TITLE'),
                'template': client.translate(error.type + '_MESSAGE', error.additionalInfo),
                'okText': client.translate('OK')
            });
        }
        else {
            return client.popup.alert({
                'cssClass': client.currentLanguage.direction,
                'template': error,
                'okText': client.translate('OK')
            });
        }
    }
};
//------------------------------------------------------
//-- confirm
//------------------------------------------------------
exports.confirm = function (title, message, params) {
    var client = client_1.Client.getInstance();
    return client.popup.confirm({
        title: client.translate(title, params),
        template: client.translate(message, params),
        cssClass: client.currentLanguage.direction,
        'okText': client.translate('OK'),
        'cancelText': client.translate('CANCEL')
    });
};
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
