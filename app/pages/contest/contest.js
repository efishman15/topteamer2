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
var contest_chart_1 = require('../../components/contest-chart/contest-chart');
var contest_participants_1 = require('../../pages/contest-participants/contest-participants');
var quiz_1 = require('../../pages/quiz/quiz');
var facebook_post_1 = require('../../pages/facebook-post/facebook-post');
var like_1 = require('../../pages/like/like');
var client_1 = require('../../providers/client');
var shareService = require('../../providers/share');
var soundService = require('../../providers/sound');
var ContestPage = (function () {
    function ContestPage(params) {
        var _this = this;
        this.contestChart = {};
        this.lastQuizResults = null;
        this.animateLastResults = false;
        this.client = client_1.Client.getInstance();
        this.contestChart = params.data.contestChart;
        this.client.events.subscribe('topTeamer:quizFinished', function (eventData) {
            //Event data comes as an array of data objects - we expect only one (last quiz results)
            _this.lastQuizResults = eventData[0];
            //Exit from the quiz
            _this.client.nav.pop();
            if (_this.lastQuizResults.data.facebookPost) {
                _this.animateLastResults = false;
                var modal = ionic_1.Modal.create(facebook_post_1.FacebookPostPage, { 'quizResults': _this.lastQuizResults });
                _this.client.nav.present(modal);
            }
            else {
                //Exit from the quiz
                _this.client.nav.pop();
                _this.animateLastResults = true;
            }
            setTimeout(function () {
                soundService.play(_this.lastQuizResults.data.sound);
            }, 500);
        });
    }
    ContestPage.prototype.onDateChanged = function (event) {
        console.log('onDateChanged(): ', event.date, ' - formatted: ', event.formatted, ' - epoc timestamp: ', event.epoc);
    };
    ContestPage.prototype.onPageWillLeave = function () {
        this.animateLastResults = false;
        this.lastQuizResults = null;
    };
    ContestPage.prototype.playContest = function (source) {
        this.client.nav.push(quiz_1.QuizPage, { 'contestId': this.contestChart.contest._id, 'source': source });
    };
    ContestPage.prototype.showParticipants = function (source) {
        this.client.nav.push(contest_participants_1.ContestParticipantsPage, { 'contest': this.contestChart.contest, 'source': source });
    };
    ContestPage.prototype.joinContest = function (team, source, action) {
        var _this = this;
        if (action === void 0) { action = 'join'; }
        var postData = { 'contestId': this.contestChart.contest._id, 'teamId': team };
        this.client.serverPost('contests/join', postData).then(function (data) {
            FlurryAgent.logEvent('contest/' + action, {
                'contestId': _this.contestChart.contest._id,
                'team': '' + team,
                'sourceClick': source
            });
            _this.contestChart = contestsService.prepareContestChart(data.contest, 'starts');
            _this.contestChartComponent.refresh(_this.contestChart);
        });
    };
    ContestPage.prototype.switchTeams = function (source) {
        this.joinContest(1 - this.contestChart.contest.myTeam, source, 'switchTeams');
    };
    ContestPage.prototype.editContest = function () {
        //TODO: edit contest
        alert('edit contest');
    };
    ContestPage.prototype.share = function (source) {
        shareService.share(this.contestChart.contest);
    };
    ContestPage.prototype.like = function () {
        this.client.nav.push(like_1.LikePage, { 'contest': this.contestChart.contest });
    };
    ContestPage.prototype.onTeamSelected = function (data) {
        if (this.contestChart.contest.myTeam === 0 || this.contestChart.contest.myTeam === 1) {
            if (data.teamId !== this.contestChart.contest.myTeam) {
                this.switchTeams(data.source);
            }
            else {
                this.playContest(data.source);
            }
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
    __decorate([
        core_1.ViewChild(contest_chart_1.ContestChartComponent), 
        __metadata('design:type', contest_chart_1.ContestChartComponent)
    ], ContestPage.prototype, "contestChartComponent", void 0);
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
