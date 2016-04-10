"use strict";
var client_1 = require('./client');
//------------------------------------------------------
//-- getLoginStatus
//------------------------------------------------------
exports.getLoginStatus = function () { return new Promise(function (resolve, reject) {
    if (!window.cordova) {
        window.FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                resolve({ 'connected': true, 'response': response });
            }
            else {
                resolve({ 'connected': false, 'response': response });
            }
        });
    }
    else {
        window.facebookConnectPlugin.getLoginStatus(function (response) {
            if (response && response.status === 'unknown') {
                //Give it another try as facebook native is not yet initiated
                setTimeout(function () {
                    window.facebookConnectPlugin.getLoginStatus(function (response) {
                        if (response && response.status === 'connected') {
                            resolve({ 'connected': true, 'response': response });
                        }
                        else {
                            resolve({ 'connected': false, 'response': response });
                        }
                    }, function (error) {
                        resolve({ 'connected': false, 'error': error });
                    });
                }, 500);
            }
            else if (response && response.status === 'connected') {
                resolve({ 'connected': true, 'response': response });
            }
            else {
                resolve({ 'connected': false, 'response': response });
            }
        }, function (error) {
            resolve({ 'connected': false, 'error': error });
        });
    }
}); };
//------------------------------------------------------
//-- login
//------------------------------------------------------
exports.login = function (permissions, rerequestDeclinedPermissions) { return new Promise(function (resolve, reject) {
    var client = client_1.Client.getInstance();
    if (!permissions) {
        permissions = client.settings.facebook.readPermissions;
    }
    if (!window.cordova) {
        var permissionObject = {};
        permissionObject['scope'] = permissions.toString();
        if (rerequestDeclinedPermissions) {
            permissionObject['auth_type'] = 'rerequest';
        }
        window.FB.login(function (response) {
            if (response.authResponse) {
                resolve(response);
            }
            else {
                reject(response.status);
            }
        }, permissionObject);
    }
    else {
        window.facebookConnectPlugin.login(client.settings.facebook.readPermissions, function (response) {
            resolve(response);
        }, function (err) {
            reject(err);
        });
    }
}); };
//------------------------------------------------------
//-- logout
//------------------------------------------------------
exports.logout = function () { return new Promise(function (resolve, reject) {
    if (!window.cordova) {
        window.FB.logout(function (response) {
            resolve(response);
        });
    }
    else {
        window.facebookConnectPlugin.logout(function (response) {
            resolve(response);
        });
    }
}); };
//------------------------------------------------------
//-- post
//------------------------------------------------------
exports.post = function (story) { return new Promise(function (resolve, reject) {
    if (window.cordova) {
        var mobilePostObject = {
            'method': 'share_open_graph',
            'action': story.action,
            'previewPropertyName': story.object.name,
            'previewPropertyValue': story.object.value
        };
        window.facebookConnectPlugin.showDialog(mobilePostObject, function (response) {
            resolve(response);
        }, function (error) {
            reject(error);
        });
    }
    else {
        var webPostObject = {
            'method': 'share_open_graph',
            'action_type': story.action,
            'action_properties': {}
        };
        webPostObject.action_properties[story.object.name] = story.object.value;
        try {
            window.FB.ui(webPostObject, function (response) {
                resolve(response);
            });
        }
        catch (error) {
            reject(error);
        }
    }
}); };
//------------------------------------------------------
//-- buy
//------------------------------------------------------
exports.buy = function (purchaseDialogData) { return new Promise(function (resolve, reject) {
    try {
        window.FB.ui(purchaseDialogData, function (response) {
            resolve(response);
        });
    }
    catch (error) {
        reject(error);
    }
}); };
//# sourceMappingURL=facebook.js.map