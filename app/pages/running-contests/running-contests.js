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
var contest_list_1 = require('../../components/contest-list/contest-list');
var server_1 = require('../../providers/server');
var contest_1 = require('../contest/contest');
var RunningContestsPage = (function () {
    function RunningContestsPage(app) {
        this.app = app;
        this.nav = this.app.getComponent('nav');
        this.server = server_1.Server.getInstance();
    }
    RunningContestsPage.prototype.onPageDidEnter = function () {
        this.app.setTitle(this.server.translate('RUNNING_CONTESTS'));
        this.contestList.refresh();
    };
    RunningContestsPage.prototype.onContestSelected = function (data) {
        this.nav.push(contest_1.ContestPage, { 'contest': data.contest });
    };
    __decorate([
        core_1.ViewChild(contest_list_1.ContestListComponent), 
        __metadata('design:type', contest_list_1.ContestListComponent)
    ], RunningContestsPage.prototype, "contestList", void 0);
    RunningContestsPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/running-contests/running-contests.html',
            directives: [contest_list_1.ContestListComponent]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.IonicApp !== 'undefined' && ionic_1.IonicApp) === 'function' && _a) || Object])
    ], RunningContestsPage);
    return RunningContestsPage;
    var _a;
})();
exports.RunningContestsPage = RunningContestsPage;
