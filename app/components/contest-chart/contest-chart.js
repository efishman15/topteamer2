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
var client_1 = require('../../providers/client');
var alertService = require('../../providers/alert');
var contestsService = require('../../providers/contests');
var objects_1 = require('../../objects/objects');
var WIDTH_MARGIN = 2;
var ContestChartComponent = (function () {
    function ContestChartComponent() {
        var _this = this;
        this.contestSelected = new core_1.EventEmitter();
        this.myTeamSelected = new core_1.EventEmitter();
        this.contestButtonClick = new core_1.EventEmitter();
        this.joinedContest = new core_1.EventEmitter();
        this.events = {
            'dataplotClick': function (eventObj, dataObj) {
                var teamId = dataObj.dataIndex;
                if (_this.client.currentLanguage.direction === 'rtl') {
                    teamId = 1 - teamId;
                }
                _this.teamSelected(teamId, 'teamBar');
                _this.chartTeamEventHandled = true;
            },
            'dataLabelClick': function (eventObj, dataObj) {
                var teamId = dataObj.dataIndex;
                if (_this.client.currentLanguage.direction === 'rtl') {
                    teamId = 1 - teamId;
                }
                _this.teamSelected(teamId, 'teamPercent');
                _this.chartTeamEventHandled = true;
            },
            'annotationClick': function (eventObj, dataObj) {
                var teamId;
                if (dataObj.annotationOptions.text === _this.contest.teams[0].name) {
                    teamId = 0;
                }
                else {
                    teamId = 1;
                }
                _this.teamSelected(teamId, 'teamName');
                _this.chartTeamEventHandled = true;
            },
            'chartClick': function (eventObj, dataObj) {
                if (!_this.chartTeamEventHandled) {
                    _this.onContestSelected('chart');
                }
                _this.chartTeamEventHandled = false;
            }
        };
        this.client = client_1.Client.getInstance();
    }
    ContestChartComponent.prototype.onContestSelected = function (source) {
        if (this.contest.state === 'join') {
            alertService.alert({ 'type': 'SERVER_ERROR_NOT_JOINED_TO_CONTEST' });
        }
        else {
            this.contestSelected.emit({ 'contest': this.contest, 'source': source });
        }
    };
    ContestChartComponent.prototype.teamSelected = function (teamId, source) {
        if (this.contest.state === 'play') {
            if (teamId !== this.contest.myTeam) {
                this.switchTeams(source);
            }
            else {
                //My team - start the game
                this.client.logEvent('contest/myTeam', {
                    'contestId': this.contest._id,
                    'team': '' + this.contest.myTeam,
                    'sourceClick': source
                });
                this.myTeamSelected.emit({ 'contest': this.contest, 'source': source });
            }
        }
        else if (this.contest.state !== 'finished') {
            this.joinContest(teamId, source, false, true, false).then(function () {
            }, function () {
            });
        }
    };
    ContestChartComponent.prototype.ngOnInit = function () {
        this.initChart();
    };
    ContestChartComponent.prototype.initChart = function () {
        var _this = this;
        if (!this.chart) {
            this.netChartHeight = 1 - (this.client.settings.charts.contest.size.topMarginPercent / 100);
            if (this.client.currentLanguage.direction === 'ltr') {
                this.teamsOrder = [0, 1];
            }
            else {
                this.teamsOrder = [1, 0];
            }
            this.adjustScores();
            window.FusionCharts.ready(function () {
                _this.chart = new window.FusionCharts({
                    type: _this.client.settings.charts.contest.type,
                    renderAt: _this.id + '-container',
                    width: _this.client.chartWidth - WIDTH_MARGIN,
                    height: _this.client.chartHeight,
                    dataFormat: 'json',
                    dataSource: _this.contest.dataSource,
                    events: _this.events
                });
                _this.chart.render();
            });
        }
    };
    ContestChartComponent.prototype.refresh = function (contest) {
        if (contest) {
            //new contest object arrived
            this.contest = contest;
            this.adjustScores();
        }
        this.chart.setJSONData(this.contest.dataSource);
    };
    ContestChartComponent.prototype.onResize = function () {
        this.chart.resizeTo(this.client.chartWidth - WIDTH_MARGIN, this.client.chartHeight);
    };
    ContestChartComponent.prototype.adjustScores = function () {
        //Scores
        this.contest.dataSource.dataset[0].data[0].value = this.contest.teams[this.teamsOrder[0]].chartValue * this.netChartHeight;
        this.contest.dataSource.dataset[0].data[1].value = this.contest.teams[this.teamsOrder[1]].chartValue * this.netChartHeight;
        //Others (in grey)
        this.contest.dataSource.dataset[1].data[0].value = this.netChartHeight - this.contest.dataSource.dataset[0].data[0].value;
        this.contest.dataSource.dataset[1].data[1].value = this.netChartHeight - this.contest.dataSource.dataset[0].data[1].value;
    };
    ContestChartComponent.prototype.joinContest = function (team, source, switchTeams, showAlert, delayRankModal) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            contestsService.join(_this.contest._id, team).then(function (data) {
                _this.refresh(data.contest);
                _this.joinedContest.emit({ 'contest': data.contest });
                _this.client.logEvent('contest/' + (!switchTeams ? 'join' : 'switchTeams'), {
                    'contestId': _this.contest._id,
                    'team': '' + _this.contest.myTeam,
                    'sourceClick': source
                });
                //Should get xp if fresh join
                var rankModal;
                if (data.xpProgress && data.xpProgress.addition > 0) {
                    //Adds the xp with animation
                    if (data.xpProgress.rankChanged) {
                        rankModal = _this.client.createModalPage('NewRankPage', {
                            'xpProgress': data.xpProgress
                        });
                        if (!delayRankModal) {
                            rankModal.onDismiss(function () {
                                resolve();
                            });
                        }
                        else {
                            resolve(rankModal);
                        }
                        _this.client.addXp(data.xpProgress).then(function () {
                        }, function () {
                            reject();
                        });
                    }
                }
                if (showAlert) {
                    alertService.alert({
                        'type': 'SELECT_TEAM_ALERT',
                        'additionalInfo': { 'team': _this.contest.teams[_this.contest.myTeam].name }
                    }).then(function () {
                        if (rankModal && !delayRankModal) {
                            _this.client.nav.present(rankModal);
                        }
                        else {
                            resolve(rankModal);
                        }
                    });
                }
                else {
                    if (rankModal && !delayRankModal) {
                        //resolve will be called upon dismiss
                        _this.client.nav.present(rankModal);
                    }
                    else {
                        resolve(rankModal);
                    }
                }
            }, function () {
                reject();
            });
        });
    };
    ContestChartComponent.prototype.switchTeams = function (source) {
        this.joinContest(1 - this.contest.myTeam, source, true, true, false).then(function () {
        }, function () {
        });
    };
    ContestChartComponent.prototype.onContestButtonClick = function () {
        var _this = this;
        if (this.contest.state === 'join') {
            //Will prompt an alert with 2 buttons with the team names
            //Upon selecting a team - send the user directly to play
            var cssClass;
            if (this.contest.teams[0].name.length + this.contest.teams[1].name.length > this.client.settings.contest.maxTeamsLengthForLargeFonts) {
                cssClass = 'chart-popup-button-team-small';
            }
            else {
                cssClass = 'chart-popup-button-team-normal';
            }
            alertService.alert({ 'type': 'PLAY_CONTEST_CHOOSE_TEAM' }, [
                {
                    'text': this.contest.teams[0].name,
                    'cssClass': cssClass + '-' + this.teamsOrder[0],
                    'handler': function () {
                        _this.joinContest(0, 'button', false, false, true).then(function (rankModal) {
                            _this.contestButtonClick.emit({ 'contest': _this.contest, 'source': 'button' });
                            if (rankModal) {
                                _this.client.nav.present(rankModal);
                            }
                        }, function () {
                        });
                    }
                },
                {
                    'text': this.contest.teams[1].name,
                    'cssClass': cssClass + '-' + this.teamsOrder[1],
                    'handler': function () {
                        _this.joinContest(1, 'button', false, false, true).then(function (rankModal) {
                            _this.contestButtonClick.emit({ 'contest': _this.contest, 'source': 'button' });
                            if (rankModal) {
                                _this.client.nav.present(rankModal);
                            }
                        }, function () {
                        });
                    }
                },
            ]);
        }
        else {
            this.contestButtonClick.emit({ 'contest': this.contest, 'source': 'button' });
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], ContestChartComponent.prototype, "id", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', objects_1.Contest)
    ], ContestChartComponent.prototype, "contest", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], ContestChartComponent.prototype, "alternateButtonText", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ContestChartComponent.prototype, "contestSelected", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ContestChartComponent.prototype, "myTeamSelected", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ContestChartComponent.prototype, "contestButtonClick", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ContestChartComponent.prototype, "joinedContest", void 0);
    ContestChartComponent = __decorate([
        core_1.Component({
            selector: 'contest-chart',
            templateUrl: 'build/components/contest-chart/contest-chart.html'
        }), 
        __metadata('design:paramtypes', [])
    ], ContestChartComponent);
    return ContestChartComponent;
})();
exports.ContestChartComponent = ContestChartComponent;
//# sourceMappingURL=contest-chart.js.map