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
var my_contests_1 = require('../my-contests/my-contests');
var running_contests_1 = require('../running-contests/running-contests');
var leadboard_tabs_1 = require('../leaderboard-tabs/leadboard-tabs');
var client_1 = require('../../providers/client');
var MainTabsPage = (function () {
    function MainTabsPage() {
        // set the root pages for each tab
        this.rootMyContestsPage = my_contests_1.MyContestsPage;
        this.rootRunningContestsPage = running_contests_1.RunningContestsPage;
        this.rootLeaderboardTabs = leadboard_tabs_1.LeaderboardTabsPage;
        this.client = client_1.Client.getInstance();
    }
    MainTabsPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/main-tabs/main-tabs.html'
        }), 
        __metadata('design:paramtypes', [])
    ], MainTabsPage);
    return MainTabsPage;
})();
exports.MainTabsPage = MainTabsPage;
