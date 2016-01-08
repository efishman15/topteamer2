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
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
var ContestPage = (function () {
    function ContestPage(params) {
        this.contestChart = {};
        this.client = client_1.Client.getInstance();
        this.contestChart = params.data.contestChart;
    }
    ContestPage.prototype.onPageWillEnter = function () {
        this.client.ionicApp.setTitle(this.client.translate('WHO_SMARTER_QUESTION'));
    };
    ContestPage.prototype.playContest = function (source) {
        //TODO: play contest
        alert('play contest, source: ' + source);
    };
    ContestPage.prototype.showParticipants = function (source) {
        //TODO: show participants
        alert('show participants, source: ' + source);
    };
    ContestPage.prototype.joinContest = function (team, source) {
        var _this = this;
        var postData = { 'contestId': this.contestChart.contest._id, 'teamId': team };
        this.client.serverPost('contests/join', postData).then(function (data) {
            FlurryAgent.logEvent('contest/join', {
                'contestId': _this.contestChart.contest._id,
                'team': '' + team,
                'sourceClick': source
            });
            _this.contestChart = contestsService.prepareContestChart(data.contest, 'starts');
        });
    };
    ContestPage.prototype.switchTeams = function (source) {
        this.joinContest(1 - this.contestChart.contest.myTeam, source);
    };
    ContestPage.prototype.editContest = function () {
        //TODO: edit contest
        alert('edit contest');
    };
    ContestPage.prototype.share = function () {
        //TODO: share
        alert('share');
    };
    ContestPage.prototype.like = function () {
        //TODO: like
        alert('like');
    };
    ContestPage.prototype.onTeamSelected = function (data) {
        if (this.contestChart.contest.myTeam === 0 || this.contestChart.contest.myTeam === 1) {
            this.switchTeams(data.source);
        }
        else {
            this.joinContest(data.teamId, data.source);
        }
    };
    ContestPage.prototype.onContestSelected = function (data) {
        if (this.contestChart.contest.myTeam === 0 || this.contestChart.contest.myTeam === 1) {
            this.playContest('chart');
        }
    };
    ContestPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/contest/contest.html',
            directives: [contest_chart_1.ContestChartComponent]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.NavParams !== 'undefined' && ionic_1.NavParams) === 'function' && _a) || Object])
    ], ContestPage);
    return ContestPage;
    var _a;
})();
exports.ContestPage = ContestPage;