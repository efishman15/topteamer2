var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_angular_1 = require('ionic-angular');
var core_1 = require('angular2/core');
var contest_list_1 = require('../../components/contest-list/contest-list');
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
var RunningContestsPage = (function () {
    function RunningContestsPage() {
        this.client = client_1.Client.getInstance();
    }
    RunningContestsPage.prototype.onPageWillEnter = function () {
        this.client.logEvent('page/runningContests');
        if (this.contestList) {
            this.refreshList();
        }
    };
    RunningContestsPage.prototype.ngAfterViewInit = function () {
        this.refreshList();
    };
    RunningContestsPage.prototype.onContestSelected = function (data) {
        contestsService.openContest(data.contest._id);
    };
    RunningContestsPage.prototype.refreshList = function () {
        this.contestList.refresh();
    };
    __decorate([
        core_1.ViewChild(contest_list_1.ContestListComponent), 
        __metadata('design:type', contest_list_1.ContestListComponent)
    ], RunningContestsPage.prototype, "contestList", void 0);
    RunningContestsPage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/running-contests/running-contests.html',
            directives: [contest_list_1.ContestListComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], RunningContestsPage);
    return RunningContestsPage;
})();
exports.RunningContestsPage = RunningContestsPage;
