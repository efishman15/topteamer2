var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_1 = require('ionic/ionic');
var recently_finished_contests_1 = require('../recently-finished-contests/recently-finished-contests');
var friends_leaderboard_1 = require('../friends-leaderboard/friends-leaderboard');
var weekly_leaderboard_1 = require('../weekly-leaderboard/weekly-leaderboard');
var client_1 = require('../../providers/client');
var LeaderboardTabsPage = (function () {
    function LeaderboardTabsPage() {
        // set the root pages for each tab
        this.rootRecentlyFinishedContestsPage = recently_finished_contests_1.RecentlyFinishedContestsPage;
        this.rootFriendsLeaderboardPage = friends_leaderboard_1.FriendsLeaderboardPage;
        this.rootWeeklyLeaderboardPage = weekly_leaderboard_1.WeeklyLeaderboardPage;
        this.client = client_1.Client.getInstance();
        this.client.setPageTitle('LEADERBOARDS');
    }
    LeaderboardTabsPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/leaderboard-tabs/leaderboard-tabs.html'
        }), 
        __metadata('design:paramtypes', [])
    ], LeaderboardTabsPage);
    return LeaderboardTabsPage;
})();
exports.LeaderboardTabsPage = LeaderboardTabsPage;
