var client_1 = require('./client');
//------------------------------------------------------
//-- clearCache
//------------------------------------------------------
exports.clearCache = function () {
    var client = client_1.Client.getInstance();
    return client.serverPost('system/clearCache');
};
//------------------------------------------------------
//-- restart
//------------------------------------------------------
exports.restart = function () {
    var client = client_1.Client.getInstance();
    return client.serverPost('system/restart');
};
//# sourceMappingURL=system.js.map