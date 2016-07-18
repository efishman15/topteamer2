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
var ionic_angular_1 = require('ionic-angular');
var contest_chart_1 = require('../../components/contest-chart/contest-chart');
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
var soundService = require('../../providers/sound');
var ContestPage = (function () {
    function ContestPage(params) {
        var _this = this;
        this.lastQuizResults = null;
        this.animateLastResults = false;
        this.client = client_1.Client.getInstance();
        this.contest = params.data.contest;
        this.client.events.subscribe('topTeamer:quizFinished', function (eventData) {
            //Prepare some client calculated fields on the contest
            contestsService.setContestClientData(eventData[0].contest);
            //Refresh the contest chart and the contest details
            _this.refreshContestChart(eventData[0].contest);
            //Event data comes as an array of data objects - we expect only one (last quiz results)
            _this.lastQuizResults = eventData[0];
            if (_this.lastQuizResults.data.facebookPost) {
                _this.animateLastResults = false;
                _this.client.showModalPage('FacebookPostPage', { 'quizResults': _this.lastQuizResults });
            }
            else {
                _this.animateLastResults = true;
                setTimeout(function () {
                    _this.animateLastResults = false;
                }, _this.client.settings.quiz.finish.animateResultsTimeout);
            }
            var soundFile = _this.lastQuizResults.data.sound;
            setTimeout(function () {
                soundService.play(soundFile);
            }, 500);
        });
        this.client.events.subscribe('topTeamer:contestUpdated', function (eventData) {
            _this.refreshContestChart(eventData[0]);
        });
    }
    ContestPage.prototype.ionViewWillEnter = function () {
        this.client.logEvent('page/contest', { 'contestId': this.contest._id });
    };
    ContestPage.prototype.ionViewWillLeave = function () {
        this.animateLastResults = false;
        this.lastQuizResults = null;
    };
    ContestPage.prototype.showParticipants = function (source) {
        this.client.openPage('ContestParticipantsPage', { 'contest': this.contest, 'source': source });
    };
    ContestPage.prototype.refreshContestChart = function (contest) {
        this.contest = contest;
        this.contestChartComponent.refresh(contest);
    };
    ContestPage.prototype.share = function (source) {
        this.client.share(this.contest.status !== 'finished' ? this.contest : null, source);
    };
    ContestPage.prototype.like = function () {
        this.client.logEvent('like/click');
        window.open(this.client.settings.general.facebookFanPage, '_new');
    };
    ContestPage.prototype.editContest = function () {
        this.client.logEvent('contest/edit/click', { 'contestId': this.contest._id });
        this.client.openPage('SetContestPage', { 'mode': 'edit', 'contest': this.contest });
    };
    ContestPage.prototype.switchTeams = function () {
        this.contestChartComponent.switchTeams('contest/switchTeams');
    };
    ContestPage.prototype.onContestSelected = function () {
        this.playOrLeaderboard('contest/chart');
    };
    ContestPage.prototype.onMyTeamSelected = function () {
        this.playContest('contest/myTeam');
    };
    ContestPage.prototype.onContestButtonClick = function () {
        this.playOrLeaderboard('contest/button');
    };
    ContestPage.prototype.playOrLeaderboard = function (source) {
        if (this.contest.state === 'play') {
            this.playContest(source);
        }
        else if (this.contest.state === 'finished') {
            this.showParticipants(source);
        }
    };
    ContestPage.prototype.playContest = function (source) {
        this.client.logEvent('contest/play', {
            'contestId': this.contest._id,
            'team': '' + this.contest.myTeam,
            'sourceClick': source
        });
        this.client.openPage('QuizPage', { 'contest': this.contest, 'source': source });
    };
    ContestPage.prototype.onResize = function () {
        this.contestChartComponent.onResize();
    };
    __decorate([
        core_1.ViewChild(contest_chart_1.ContestChartComponent), 
        __metadata('design:type', contest_chart_1.ContestChartComponent)
    ], ContestPage.prototype, "contestChartComponent", void 0);
    ContestPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/contest/contest.html',
            directives: [contest_chart_1.ContestChartComponent]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavParams])
    ], ContestPage);
    return ContestPage;
})();
exports.ContestPage = ContestPage;
//# sourceMappingURL=contest.js.map