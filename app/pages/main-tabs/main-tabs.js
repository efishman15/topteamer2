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
var core_1 = require('angular2/core');
var my_contests_1 = require('../my-contests/my-contests');
var running_contests_1 = require('../running-contests/running-contests');
var leaderboards_1 = require('../leaderboards/leaderboards');
var client_1 = require('../../providers/client');
var MainTabsPage = (function () {
    function MainTabsPage() {
        var _this = this;
        // set the root pages for each tab
        this.rootMyContestsPage = my_contests_1.MyContestsPage;
        this.rootRunningContestsPage = running_contests_1.RunningContestsPage;
        this.rootLeaderboardsPage = leaderboards_1.LeaderboardsPage;
        this.client = client_1.Client.getInstance();
        this.client.events.subscribe('topTeamer:contestCreated', function (eventData) {
            _this.needToRefreshList = true;
        });
        this.client.events.subscribe('topTeamer:contestRemoved', function () {
            _this.needToRefreshList = true;
        });
        this.client.events.subscribe('topTeamer:contestUpdated', function (eventData) {
            _this.needToRefreshList = true;
        });
    }
    MainTabsPage.prototype.onPageWillEnter = function () {
        if (this.needToRefreshList) {
            var selectedPage = this.mainTabs.getSelected().getActive();
            if (selectedPage.willEnter) {
                selectedPage.willEnter();
            }
            this.needToRefreshList = false;
        }
    };
    __decorate([
        core_1.ViewChild(ionic_1.Tabs), 
        __metadata('design:type', (typeof (_a = typeof ionic_1.Tabs !== 'undefined' && ionic_1.Tabs) === 'function' && _a) || Object)
    ], MainTabsPage.prototype, "mainTabs", void 0);
    MainTabsPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/main-tabs/main-tabs.html'
        }), 
        __metadata('design:paramtypes', [])
    ], MainTabsPage);
    return MainTabsPage;
    var _a;
})();
exports.MainTabsPage = MainTabsPage;
