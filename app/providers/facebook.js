//------------------------------------------------------
//-- getLoginStatus
//------------------------------------------------------
exports.getLoginStatus = function () { return new Promise(function (resolve, reject) {
    if (!window.cordova) {
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                resolve({ 'connected': true, 'response': response });
            }
            else {
                resolve({ 'connected': false, 'response': response });
            }
        });
    }
    else {
        facebookConnectPlugin.getLoginStatus(function (response) {
            if (response && response.status === 'unknown') {
                //Give it another try as facebook native is not yet initiated
                setTimeout(function () {
                    facebookConnectPlugin.getLoginStatus(function (response) {
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
exports.login = function (rerequestDeclinedPermissions) { return new Promise(function (resolve, reject) {
    var permissions = ['public_profile', 'email', 'user_friends'];
    if (!window.cordova) {
        var permissionObject = {};
        if (permissions && permissions.length > 0) {
            permissionObject.scope = permissions.toString();
            if (rerequestDeclinedPermissions) {
                permissionObject.auth_type = 'rerequest';
            }
        }
        FB.login(function (response) {
            if (response.authResponse) {
                resolve(response);
            }
            else {
                reject(response.status);
            }
        });
    }
    else {
        facebookConnectPlugin.login(permissions, function (response) {
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
        FB.logout(function () {
            resolve();
        });
    }
    else {
        facebookConnectPlugin.logout(function () {
            resolve();
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
        facebookConnectPlugin.showDialog(mobilePostObject, function (response) {
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
            FB.ui(webPostObject, function (response) {
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
        FB.ui(purchaseDialogData, function (response) {
            resolve(response);
        });
    }
    catch (error) {
        reject(error);
    }
}); };
