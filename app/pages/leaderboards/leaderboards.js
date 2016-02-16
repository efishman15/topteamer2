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
var player_info_1 = require('../../components/player-info/player-info');
var simple_tabs_1 = require('../../components/simple-tabs/simple-tabs');
var simple_tab_1 = require('../../components/simple-tab/simple-tab');
var contest_list_1 = require('../../components/contest-list/contest-list');
var leaders_1 = require('../../components/leaders/leaders');
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
var LeaderboardsPage = (function () {
    function LeaderboardsPage() {
        this.mode = 'contests';
        this.client = client_1.Client.getInstance();
    }
    LeaderboardsPage.prototype.onPageWillEnter = function () {
        if (this.simpleTabsComponent) {
            this.simpleTabsComponent.switchToTab(0);
        }
    };
    LeaderboardsPage.prototype.ngAfterViewInit = function () {
        this.simpleTabsComponent.switchToTab(0);
    };
    LeaderboardsPage.prototype.showRecentlyFinishedContests = function () {
        this.mode = 'contests';
        this.contestList.refresh();
    };
    LeaderboardsPage.prototype.showFriendsLeaderboard = function () {
        //TODO: friendsPermissionJustGranted
        this.mode = 'leaders';
        this.leadersComponent.showFriends();
    };
    LeaderboardsPage.prototype.showWeeklyLeaderboard = function () {
        this.mode = 'leaders';
        this.leadersComponent.showWeekly();
    };
    LeaderboardsPage.prototype.onContestSelected = function (data) {
        contestsService.openContest(data.contest._id);
    };
    LeaderboardsPage.prototype.refreshList = function () {
        if (this.mode === 'contests') {
            this.contestList.refresh();
        }
    };
    __decorate([
        core_1.ViewChild(simple_tabs_1.SimpleTabsComponent), 
        __metadata('design:type', simple_tabs_1.SimpleTabsComponent)
    ], LeaderboardsPage.prototype, "simpleTabsComponent", void 0);
    __decorate([
        core_1.ViewChild(contest_list_1.ContestListComponent), 
        __metadata('design:type', contest_list_1.ContestListComponent)
    ], LeaderboardsPage.prototype, "contestList", void 0);
    __decorate([
        core_1.ViewChild(leaders_1.LeadersComponent), 
        __metadata('design:type', leaders_1.LeadersComponent)
    ], LeaderboardsPage.prototype, "leadersComponent", void 0);
    LeaderboardsPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/leaderboards/leaderboards.html',
            directives: [player_info_1.PlayerInfoComponent, simple_tabs_1.SimpleTabsComponent, simple_tab_1.SimpleTabComponent, contest_list_1.ContestListComponent, leaders_1.LeadersComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], LeaderboardsPage);
    return LeaderboardsPage;
})();
exports.LeaderboardsPage = LeaderboardsPage;
