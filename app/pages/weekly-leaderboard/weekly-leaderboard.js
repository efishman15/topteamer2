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
var contest_leaders_1 = require('../../components/contest-leaders/contest-leaders');
var client_1 = require('../../providers/client');
var WeeklyLeaderboardPage = (function () {
    function WeeklyLeaderboardPage() {
        this.client = client_1.Client.getInstance();
    }
    WeeklyLeaderboardPage.prototype.onPageDidEnter = function () {
        this.contestLeadersComponent.showWeekly();
    };
    __decorate([
        core_1.ViewChild(contest_leaders_1.ContestLeadersComponent), 
        __metadata('design:type', contest_leaders_1.ContestLeadersComponent)
    ], WeeklyLeaderboardPage.prototype, "contestLeadersComponent", void 0);
    WeeklyLeaderboardPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/weekly-leaderboard/weekly-leaderboard.html',
            directives: [contest_leaders_1.ContestLeadersComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], WeeklyLeaderboardPage);
    return WeeklyLeaderboardPage;
})();
exports.WeeklyLeaderboardPage = WeeklyLeaderboardPage;
