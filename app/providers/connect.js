var client_1 = require('./client');
var facebookService = require('./facebook');
var objects_1 = require('../objects/objects');
var CONNECT_INFO_KEY = 'connectInfo';
//------------------------------------------------------
//-- createGuest
//------------------------------------------------------
exports.createGuest = function () {
    var client = client_1.Client.getInstance();
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    var connectInfo = new objects_1.ConnectInfo('guest');
    connectInfo.guestInfo = new objects_1.GuestInfo(uuid);
    localStorage.setItem(CONNECT_INFO_KEY, JSON.stringify(connectInfo));
    client.connectInfo = connectInfo;
    return connectInfo;
};
//------------------------------------------------------
//-- getLoginStatus
//------------------------------------------------------
exports.getInfo = function () {
    return new Promise(function (resolve, reject) {
        var client = client_1.Client.getInstance();
        if (client.connectInfo) {
            resolve(client.connectInfo);
            return;
        }
        var connectInfoString = localStorage.getItem(CONNECT_INFO_KEY);
        if (connectInfoString) {
            client.connectInfo = JSON.parse(connectInfoString);
            resolve(client.connectInfo);
            return;
        }
        //Legacy code - for old clients which are connected to facebook but still
        //do not have
        facebookService.getLoginStatus().then(function (connectInfo) {
            if (connectInfo.facebookInfo) {
                localStorage.setItem(CONNECT_INFO_KEY, JSON.stringify({ type: 'facebook' }));
                client.connectInfo = connectInfo;
                resolve(connectInfo);
            }
            else {
                //No connect type yet
                reject();
            }
        }, function () {
            reject();
        });
    });
};
//------------------------------------------------------
//-- getLoginStatus
//------------------------------------------------------
exports.getLoginStatus = function () {
    return new Promise(function (resolve, reject) {
        exports.getInfo().then(function (connectInfo) {
            switch (connectInfo.type) {
                case 'facebook':
                    if (connectInfo.facebookInfo) {
                        resolve(connectInfo);
                    }
                    else {
                        facebookService.getLoginStatus().then(function (connectInfo) {
                            resolve(connectInfo);
                        }, function () {
                            reject();
                        });
                    }
                    break;
                case 'guest':
                    resolve(connectInfo);
                    break;
                default:
                    reject();
                    break;
            }
        }, function () {
            reject();
        });
    });
};
//------------------------------------------------------
//-- login
//------------------------------------------------------
exports.login = function (permissions, rerequestDeclinedPermissions) {
    return new Promise(function (resolve, reject) {
        exports.getInfo().then(function (connectInfo) {
            switch (connectInfo.type) {
                case 'facebook':
                    facebookService.login(permissions, rerequestDeclinedPermissions).then(function (connectInfo) {
                        resolve(connectInfo);
                    }, function () {
                        reject();
                    });
                    break;
                case 'guest':
                    //Immediate resolve, connectionInfo will include the uuid
                    resolve(connectInfo);
                    break;
            }
        }, function () {
            reject();
        });
    });
};
//------------------------------------------------------
//-- logout
//------------------------------------------------------
exports.logout = function () {
    return new Promise(function (resolve, reject) {
        exports.getInfo().then(function (connectInfo) {
            switch (connectInfo.type) {
                case 'facebook':
                    facebookService.logout().then(function () {
                        localStorage.removeItem(CONNECT_INFO_KEY);
                        resolve();
                    });
                case 'guest':
                    localStorage.removeItem(CONNECT_INFO_KEY);
                    resolve();
            }
        }, function () {
            reject();
        });
    });
};
//------------------------------------------------------
//-- post
//------------------------------------------------------
exports.post = function (story) {
    return new Promise(function (resolve, reject) {
        exports.getInfo().then(function (connectInfo) {
            switch (connectInfo.type) {
                case 'facebook':
                    facebookService.post(story).then(function () {
                        resolve();
                    }, function () {
                        reject();
                    });
                    break;
                case 'guest':
                    throw new Error('Posting in guest mode is not supported');
            }
        }, function () {
            reject();
        });
    });
};
//------------------------------------------------------
//-- buy
//------------------------------------------------------
exports.buy = function (purchaseDialogData) {
    return new Promise(function (resolve, reject) {
        exports.getInfo().then(function (connectInfo) {
            switch (connectInfo.type) {
                case 'facebook':
                    facebookService.buy(purchaseDialogData).then(function () {
                        resolve();
                    }, function () {
                        reject();
                    });
                    break;
                case 'guest':
                    throw new Error('Buying in guest mode is not supported');
            }
        }, function () {
            reject();
        });
    });
};
//# sourceMappingURL=connect.js.map