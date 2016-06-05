var client_1 = require('./client');
//------------------------------------------------------
//-- list
//------------------------------------------------------
exports.list = function (tab) {
    var postData = { 'tab': tab };
    var client = client_1.Client.getInstance();
    return client.serverPost('contests/list', postData);
};
//------------------------------------------------------
//-- join
//------------------------------------------------------
exports.join = function (contestId, teamId) {
    var postData = { 'contestId': contestId, 'teamId': teamId };
    var client = client_1.Client.getInstance();
    return client.serverPost('contests/join', postData);
};
//------------------------------------------------------
//-- getContest
//------------------------------------------------------
exports.getContest = function (contestId) {
    var postData = { 'contestId': contestId };
    var client = client_1.Client.getInstance();
    return client.serverPost('contests/get', postData);
};
//------------------------------------------------------
//-- openContest
//------------------------------------------------------
exports.removeContest = function (contestId) {
    var postData = { 'contestId': contestId };
    var client = client_1.Client.getInstance();
    return client.serverPost('contests/remove', postData);
};
//------------------------------------------------------
//-- openContest
//------------------------------------------------------
exports.setContest = function (contest, mode, nameChanged) {
    var postData = { 'contest': contest, 'mode': mode };
    if (nameChanged) {
        postData['nameChanged'] = nameChanged;
    }
    var client = client_1.Client.getInstance();
    return client.serverPost('contests/set', postData);
};
//------------------------------------------------------
//-- searchMyQuestions
//------------------------------------------------------
exports.searchMyQuestions = function (text, existingQuestionIds) {
    var postData = { 'text': text, 'existingQuestionIds': existingQuestionIds };
    var client = client_1.Client.getInstance();
    return client.serverPost('contests/searchMyQuestions', postData);
};
//------------------------------------------------------
//-- getQuestions
//------------------------------------------------------
exports.getQuestions = function (userQuestions) {
    var postData = { 'userQuestions': userQuestions };
    var client = client_1.Client.getInstance();
    return client.serverPost('contests/getQuestions', postData);
};
//# sourceMappingURL=contests.js.map