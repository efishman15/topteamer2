var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var simple_tabs_1 = require('../../components/simple-tabs/simple-tabs');
var simple_tab_1 = require('../../components/simple-tab/simple-tab');
var contest_list_1 = require('../../components/contest-list/contest-list');
var leaders_1 = require('../../components/leaders/leaders');
var client_1 = require('../../providers/client');
var LeaderboardsPage = (function () {
    function LeaderboardsPage() {
        this.mode = 'contests';
        this.client = client_1.Client.getInstance();
    }
    LeaderboardsPage.prototype.ionViewWillEnter = function () {
        if (this.simpleTabsComponent) {
            this.simpleTabsComponent.switchToTab(0);
        }
    };
    LeaderboardsPage.prototype.ngAfterViewInit = function () {
        this.simpleTabsComponent.switchToTab(0);
    };
    LeaderboardsPage.prototype.showRecentlyFinishedContests = function () {
        this.client.logEvent('page/leaderboard/contests');
        this.mode = 'contests';
        this.contestList.refresh();
    };
    LeaderboardsPage.prototype.showFriendsLeaderboard = function (forceRefresh) {
        this.client.logEvent('page/leaderboard/friends');
        this.mode = 'friends';
        return this.leadersComponent.showFriends(false, forceRefresh);
    };
    LeaderboardsPage.prototype.showWeeklyLeaderboard = function (forceRefresh) {
        this.client.logEvent('page/leaderboard/weekly');
        this.mode = 'weekly';
        return this.leadersComponent.showWeekly(forceRefresh);
    };
    LeaderboardsPage.prototype.onContestSelected = function (data) {
        this.client.displayContest(data.contest._id);
    };
    LeaderboardsPage.prototype.refreshList = function (forceRefresh) {
        if (this.mode === 'contests') {
            return this.contestList.refresh(forceRefresh);
        }
    };
    LeaderboardsPage.prototype.onResize = function () {
        if (this.mode === 'contests') {
            this.contestList.onResize();
        }
    };
    LeaderboardsPage.prototype.doRefresh = function (refresher) {
        switch (this.mode) {
            case 'contests':
                this.refreshList(true).then(function () {
                    refresher.complete();
                }, function () {
                    refresher.complete();
                });
                break;
            case 'friends':
                this.showFriendsLeaderboard(true).then(function () {
                    refresher.complete();
                }, function () {
                    refresher.complete();
                });
                break;
            case 'weekly':
                this.showWeeklyLeaderboard(true).then(function () {
                    refresher.complete();
                }, function () {
                    refresher.complete();
                });
                break;
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
        core_1.Component({
            templateUrl: 'build/pages/leaderboards/leaderboards.html',
            directives: [simple_tabs_1.SimpleTabsComponent, simple_tab_1.SimpleTabComponent, contest_list_1.ContestListComponent, leaders_1.LeadersComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], LeaderboardsPage);
    return LeaderboardsPage;
})();
exports.LeaderboardsPage = LeaderboardsPage;
//# sourceMappingURL=leaderboards.js.map