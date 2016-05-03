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
var contest_chart_1 = require('../../components/contest-chart/contest-chart');
var contest_participants_1 = require('../../pages/contest-participants/contest-participants');
var quiz_1 = require('../../pages/quiz/quiz');
var set_contest_1 = require('../../pages/set-contest/set-contest');
var facebook_post_1 = require('../../pages/facebook-post/facebook-post');
var new_rank_1 = require('../../pages/new-rank/new-rank');
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
var alertService = require('../../providers/alert');
var shareService = require('../../providers/share');
var soundService = require('../../providers/sound');
var ContestPage = (function () {
    function ContestPage(params) {
        var _this = this;
        this.lastQuizResults = null;
        this.animateLastResults = false;
        this.client = client_1.Client.getInstance();
        this.params = params;
        if (this.params.data.contest) {
            this.contestId = this.params.data.contest._id;
            this.contest = this.params.data.contest;
        }
        else {
            //Retrieve contest by id
            this.contestId = this.params.data.contestId;
            contestsService.getContest(this.params.data.contestId).then(function (contest) {
                _this.contest = contest;
            });
        }
        this.client.events.subscribe('topTeamer:quizFinished', function (eventData) {
            //Event data comes as an array of data objects - we expect only one (last quiz results)
            _this.lastQuizResults = eventData[0];
            if (_this.lastQuizResults.data.facebookPost) {
                _this.animateLastResults = false;
                var modal = ionic_angular_1.Modal.create(facebook_post_1.FacebookPostPage, { 'quizResults': _this.lastQuizResults });
                _this.client.nav.present(modal);
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
            //Event data comes as an array of data objects - we expect only one (contest)
            _this.contest = eventData[0];
            _this.refreshContestChart(eventData[0]);
        });
    }
    ContestPage.prototype.ngOnInit = function () {
        this.setPlayText();
    };
    ContestPage.prototype.onPageWillEnter = function () {
        this.client.logEvent('page/contest', { 'contestId': this.contestId });
    };
    ContestPage.prototype.onPageWillLeave = function () {
        this.animateLastResults = false;
        this.lastQuizResults = null;
    };
    ContestPage.prototype.playContest = function (source) {
        this.client.logEvent('contest/play', {
            'contestId': this.contest._id,
            'team': '' + this.contest.myTeam,
            'sourceClick': source
        });
        this.client.nav.push(quiz_1.QuizPage, { 'contest': this.contest, 'source': source });
    };
    ContestPage.prototype.showParticipants = function (source) {
        this.client.nav.push(contest_participants_1.ContestParticipantsPage, { 'contest': this.contest, 'source': source });
    };
    ContestPage.prototype.joinContest = function (team, source, action) {
        var _this = this;
        if (action === void 0) { action = 'join'; }
        contestsService.join(this.contest._id, team).then(function (data) {
            _this.contest = data.contest;
            _this.refreshContestChart(data.contest);
            _this.setPlayText();
            _this.client.logEvent('contest/' + action, {
                'contestId': _this.contest._id,
                'team': '' + _this.contest.myTeam,
                'sourceClick': source
            });
            //Should also cause refresh internally to our contest chart as well as notifying the tabs outside
            _this.client.events.publish('topTeamer:contestUpdated', data.contest);
            //Should get xp if fresh join
            if (data.xpProgress && data.xpProgress.addition > 0) {
                _this.client.addXp(data.xpProgress).then(function () {
                    if (data.xpProgress.rankChanged) {
                        var modal = ionic_angular_1.Modal.create(new_rank_1.NewRankPage, {
                            'xpProgress': data.xpProgress
                        });
                        _this.client.nav.present(modal);
                    }
                });
            }
        });
    };
    ContestPage.prototype.refreshContestChart = function (contest) {
        this.contestChartComponent.refresh(contest.dataSource);
    };
    ContestPage.prototype.switchTeams = function (source) {
        this.joinContest(1 - this.contest.myTeam, source, 'switchTeams');
    };
    ContestPage.prototype.editContest = function () {
        this.client.logEvent('contest/edit/click', { 'contestId': this.contest._id });
        this.client.nav.push(set_contest_1.SetContestPage, { 'mode': 'edit', 'contest': this.contest });
    };
    ContestPage.prototype.share = function (source) {
        shareService.share(source, this.contest);
    };
    ContestPage.prototype.like = function () {
        this.client.logEvent('like/click');
        window.open(this.client.settings.general.facebookFanPage, '_new');
    };
    ContestPage.prototype.setPlayText = function () {
        switch (this.contest.state) {
            case 'play':
                this.playText = this.client.translate('PLAY_FOR_TEAM', { 'team': this.contest.teams[this.contest.myTeam].name });
                break;
            case 'join':
                this.playText = this.client.translate('PLAY_CONTEST');
                break;
        }
    };
    ContestPage.prototype.onTeamSelected = function (data) {
        if (this.contest.myTeam === 0 || this.contest.myTeam === 1) {
            if (data.teamId !== this.contest.myTeam) {
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
        if (this.contest.myTeam === 0 || this.contest.myTeam === 1) {
            this.playContest(data.source);
        }
        else {
            alertService.alert({ 'type': 'SERVER_ERROR_NOT_JOINED_TO_CONTEST' });
        }
    };
    ContestPage.prototype.onResize = function () {
        this.contest.chartComponent.onResize();
    };
    __decorate([
        core_1.ViewChild(contest_chart_1.ContestChartComponent), 
        __metadata('design:type', contest_chart_1.ContestChartComponent)
    ], ContestPage.prototype, "contestChartComponent", void 0);
    ContestPage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/contest/contest.html',
            directives: [contest_chart_1.ContestChartComponent]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavParams])
    ], ContestPage);
    return ContestPage;
})();
exports.ContestPage = ContestPage;
//# sourceMappingURL=contest.js.map