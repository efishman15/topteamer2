var contest_1 = require('../pages/contest/contest');
var contest_participants_1 = require('../pages/contest-participants/contest-participants');
var contest_type_1 = require('../pages/contest-type/contest-type');
var facebook_post_1 = require('../pages/facebook-post/facebook-post');
var leaderboards_1 = require('../pages/leaderboards/leaderboards');
var login_1 = require('../pages/login/login');
var main_tabs_1 = require('../pages/main-tabs/main-tabs');
var mobile_share_1 = require('../pages/mobile-share/mobile-share');
var my_contests_1 = require('../pages/my-contests/my-contests');
var new_rank_1 = require('../pages/new-rank/new-rank');
var purchase_success_1 = require('../pages/purchase-success/purchase-success');
var question_editor_1 = require('../pages/question-editor/question-editor');
var question_stats_1 = require('../pages/question-stats/question-stats');
var quiz_1 = require('../pages/quiz/quiz');
var running_contests_1 = require('../pages/running-contests/running-contests');
var search_questions_1 = require('../pages/search-questions/search-questions');
var server_popup_1 = require('../pages/server-popup/server-popup');
var set_contest_1 = require('../pages/set-contest/set-contest');
var set_contest_admin_1 = require('../pages/set-contest-admin/set-contest-admin');
var settings_1 = require('../pages/settings/settings');
var share_1 = require('../pages/share/share');
var system_tools_1 = require('../pages/system-tools/system-tools');
//------------------------------------------------------
//-- get
//------------------------------------------------------
exports.get = function (className) {
    switch (className) {
        case 'ContestPage':
            return contest_1.ContestPage;
        case 'ContestParticipantsPage':
            return contest_participants_1.ContestParticipantsPage;
        case 'ContestTypePage':
            return contest_type_1.ContestTypePage;
        case 'FacebookPostPage':
            return facebook_post_1.FacebookPostPage;
        case 'LeaderboardsPage':
            return leaderboards_1.LeaderboardsPage;
        case 'LoginPage':
            return login_1.LoginPage;
        case 'MainTabsPage':
            return main_tabs_1.MainTabsPage;
        case 'MobileSharePage':
            return mobile_share_1.MobileSharePage;
        case 'MyContestsPage':
            return my_contests_1.MyContestsPage;
        case 'NewRankPage':
            return new_rank_1.NewRankPage;
        case 'PurchaseSuccessPage':
            return purchase_success_1.PurchaseSuccessPage;
        case 'QuestionEditorPage':
            return question_editor_1.QuestionEditorPage;
        case 'QuestionStatsPage':
            return question_stats_1.QuestionStatsPage;
        case 'QuizPage':
            return quiz_1.QuizPage;
        case 'RunningContestsPage':
            return running_contests_1.RunningContestsPage;
        case 'SearchQuestionsPage':
            return search_questions_1.SearchQuestionsPage;
        case 'ServerPopupPage':
            return server_popup_1.ServerPopupPage;
        case 'SetContestPage':
            return set_contest_1.SetContestPage;
        case 'SetContestAdminPage':
            return set_contest_admin_1.SetContestAdminPage;
        case 'SettingsPage':
            return settings_1.SettingsPage;
        case 'SharePage':
            return share_1.SharePage;
        case 'SystemToolsPage':
            return system_tools_1.SystemToolsPage;
    }
};
//# sourceMappingURL=classes.js.map