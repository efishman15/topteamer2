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
var contest_details_1 = require('../../components/contest-details/contest-details');
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
var alertService = require('../../providers/alert');
var soundService = require('../../providers/sound');
var ContestPage = (function () {
    function ContestPage(params) {
        var _this = this;
        this.lastQuizResults = null;
        this.animateLastResults = false;
        this.client = client_1.Client.getInstance();
        this.contest = params.data.contest;
        this.setPlayText();
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
            //Event data comes as an array of data objects - we expect only one (contest)
            _this.refreshContestChart(eventData[0]);
            _this.setPlayText();
        });
    }
    ContestPage.prototype.ionViewWillEnter = function () {
        this.client.logEvent('page/contest', { 'contestId': this.contest._id });
    };
    ContestPage.prototype.ionViewWillLeave = function () {
        this.animateLastResults = false;
        this.lastQuizResults = null;
    };
    ContestPage.prototype.playContest = function (source) {
        this.client.logEvent('contest/play', {
            'contestId': this.contest._id,
            'team': '' + this.contest.myTeam,
            'sourceClick': source
        });
        this.client.openPage('QuizPage', { 'contest': this.contest, 'source': source });
    };
    ContestPage.prototype.showParticipants = function (source) {
        this.client.openPage('ContestParticipantsPage', { 'contest': this.contest, 'source': source });
    };
    ContestPage.prototype.joinContest = function (team, source, action) {
        var _this = this;
        if (action === void 0) { action = 'join'; }
        contestsService.join(this.contest._id, team).then(function (data) {
            _this.setPlayText();
            _this.client.logEvent('contest/' + action, {
                'contestId': _this.contest._id,
                'team': '' + _this.contest.myTeam,
                'sourceClick': source
            });
            //Should also cause refresh internally to our contest chart as well as notifying the tabs outside
            _this.client.events.publish('topTeamer:contestUpdated', data.contest);
            //Should get xp if fresh join
            var rankModal;
            if (data.xpProgress && data.xpProgress.addition > 0) {
                _this.client.addXp(data.xpProgress).then(function () {
                    if (data.xpProgress.rankChanged) {
                        rankModal = _this.client.createModalPage('NewRankPage', {
                            'xpProgress': data.xpProgress
                        });
                    }
                });
            }
            if (action === 'switchTeams') {
                alertService.alert({ 'type': 'SWITCH_TEAMS_ALERT', 'additionalInfo': { 'team': _this.contest.teams[_this.contest.myTeam].name } }).then(function () {
                    if (rankModal) {
                        _this.client.nav.present(rankModal);
                    }
                });
            }
            else if (rankModal) {
                _this.client.nav.present(rankModal);
            }
        }, function () {
        });
    };
    ContestPage.prototype.refreshContestChart = function (contest) {
        this.contest = contest;
        this.contestChartComponent.refresh(contest);
        this.contestDetailsComponent.refresh(contest);
    };
    ContestPage.prototype.switchTeams = function (source) {
        this.joinContest(1 - this.contest.myTeam, source, 'switchTeams');
    };
    ContestPage.prototype.editContest = function () {
        this.client.logEvent('contest/edit/click', { 'contestId': this.contest._id });
        this.client.openPage('SetContestPage', { 'mode': 'edit', 'contest': this.contest });
    };
    ContestPage.prototype.share = function (source) {
        if (this.contest.status !== 'finished') {
            this.client.openPage('SharePage', { 'contest': this.contest, 'source': source });
        }
        else {
            this.client.openPage('SharePage', { 'source': source });
        }
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
        this.contestChartComponent.onResize();
    };
    __decorate([
        core_1.ViewChild(contest_chart_1.ContestChartComponent), 
        __metadata('design:type', contest_chart_1.ContestChartComponent)
    ], ContestPage.prototype, "contestChartComponent", void 0);
    __decorate([
        core_1.ViewChild(contest_details_1.ContestDetailsComponent), 
        __metadata('design:type', contest_details_1.ContestDetailsComponent)
    ], ContestPage.prototype, "contestDetailsComponent", void 0);
    ContestPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/contest/contest.html',
            directives: [contest_chart_1.ContestChartComponent, contest_details_1.ContestDetailsComponent]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavParams])
    ], ContestPage);
    return ContestPage;
})();
exports.ContestPage = ContestPage;
//# sourceMappingURL=contest.js.map