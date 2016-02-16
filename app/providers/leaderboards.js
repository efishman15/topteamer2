var client_1 = require('./client');
//------------------------------------------------------
//-- friends
//------------------------------------------------------
exports.friends = function (friendsPermissionJustGranted) {
    var postData = {};
    if (friendsPermissionJustGranted) {
        postData.friendsPermissionJustGranted = friendsPermissionJustGranted;
    }
    var client = client_1.Client.getInstance();
    return client.serverPost('leaderboard/friends', postData);
};
//------------------------------------------------------
//-- weekly
//------------------------------------------------------
exports.weekly = function () {
    var client = client_1.Client.getInstance();
    return client.serverPost('leaderboard/weekly');
};
//------------------------------------------------------
//-- contest
//------------------------------------------------------
exports.contest = function (contestId, teamId) {
    var postData = { 'contestId': contestId };
    if (teamId === 0 || teamId === 1) {
        postData.teamId = teamId;
    }
    var client = client_1.Client.getInstance();
    return client.serverPost('leaderboard/contest', postData);
};