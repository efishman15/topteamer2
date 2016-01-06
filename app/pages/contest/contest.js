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
var contest_chart_1 = require('../../components/contest-chart/contest-chart');
var server_1 = require('../../providers/server');
var contestsService = require('../../providers/contests');
var ContestPage = (function () {
    function ContestPage(app, params) {
        this.contestChart = {};
        this.app = app;
        this.params = params;
        this.server = server_1.Server.getInstance();
    }
    ContestPage.prototype.onPageWillEnter = function () {
        var _this = this;
        this.app.setTitle(this.server.translate('WHO_SMARTER_QUESTION'));
        var contestId;
        if (this.params.data.contest) {
            contestId = this.params.data.contest._id;
        }
        else {
            contestId = this.params.data.contestId;
        }
        var postData = { 'contestId': contestId };
        this.server.post('contests/get', postData).then(function (contest) {
            _this.contestChart = contestsService.prepareContestChart(contest, "starts");
            console.log("this.contestChart=" + JSON.stringify(_this.contestChart));
        });
    };
    ContestPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/contest/contest.html',
            directives: [contest_chart_1.ContestChartComponent]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.IonicApp !== 'undefined' && ionic_1.IonicApp) === 'function' && _a) || Object, (typeof (_b = typeof ionic_1.NavParams !== 'undefined' && ionic_1.NavParams) === 'function' && _b) || Object])
    ], ContestPage);
    return ContestPage;
    var _a, _b;
})();
exports.ContestPage = ContestPage;
