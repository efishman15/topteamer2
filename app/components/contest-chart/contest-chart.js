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
        this.events = {
            'dataplotClick': function (eventObj, dataObj) {
                var teamId = dataObj.dataIndex;
                if (_this.client.currentLanguage.direction === 'rtl') {
                    teamId = 1 - teamId;
                }
                _this.teamSelected(teamId, 'bar');
                _this.chartTeamEventHandled = true;
            },
            'dataLabelClick': function (eventObj, dataObj) {
                var teamId = dataObj.dataIndex;
                if (_this.client.currentLanguage.direction === 'rtl') {
                    teamId = 1 - teamId;
                }
                _this.teamSelected(teamId, 'label');
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
            this.joinContest(teamId, source);
        }
    };
    ContestChartComponent.prototype.ngOnInit = function () {
        this.setButtonText();
        this.initChart();
    };
    ContestChartComponent.prototype.initChart = function () {
        var _this = this;
        if (!this.chart) {
            this.adjustResolution();
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
            this.setButtonText();
            this.adjustResolution();
        }
        this.chart.setJSONData(this.contest.dataSource);
    };
    ContestChartComponent.prototype.onResize = function () {
        this.chart.resizeTo(this.client.chartWidth - WIDTH_MARGIN, this.client.chartHeight);
    };
    ContestChartComponent.prototype.adjustResolution = function () {
        this.contest.dataSource.annotations.groups[0].items[0].fontSize = this.client.adjustPixelRatio(this.client.settings.charts.contest.dataSource.annotations.groups[0].items[0].fontSize);
        this.contest.dataSource.annotations.groups[0].items[1].fontSize = this.client.adjustPixelRatio(this.client.settings.charts.contest.dataSource.annotations.groups[0].items[1].fontSize);
        var topMarginPercent = this.client.adjustPixelRatio(this.client.settings.charts.contest.size.topMarginPercent, true);
        var netChartHeight = 1 - (topMarginPercent / 100);
        var teamsOrder;
        if (this.client.currentLanguage.direction === 'ltr') {
            teamsOrder = [0, 1];
        }
        else {
            teamsOrder = [1, 0];
        }
        //Scores
        this.contest.dataSource.dataset[0].data[0].value = this.contest.teams[teamsOrder[0]].chartValue * netChartHeight;
        this.contest.dataSource.dataset[0].data[1].value = this.contest.teams[teamsOrder[1]].chartValue * netChartHeight;
        //Others (in grey)
        this.contest.dataSource.dataset[1].data[0].value = netChartHeight - this.contest.dataSource.dataset[0].data[0].value;
        this.contest.dataSource.dataset[1].data[1].value = netChartHeight - this.contest.dataSource.dataset[0].data[1].value;
    };
    ContestChartComponent.prototype.setButtonText = function () {
        switch (this.contest.state) {
            case 'play':
                this.buttonText = this.client.translate('PLAY_FOR_TEAM', { 'team': this.contest.teams[this.contest.myTeam].name });
                break;
            case 'join':
                this.buttonText = this.client.translate('PLAY_CONTEST');
                break;
            case 'finished':
                this.buttonText = this.finishedStateButtonText;
                break;
        }
    };
    ContestChartComponent.prototype.joinContest = function (team, source, action) {
        var _this = this;
        if (action === void 0) { action = 'join'; }
        contestsService.join(this.contest._id, team).then(function (data) {
            _this.refresh(data.contest);
            _this.client.logEvent('contest/' + action, {
                'contestId': _this.contest._id,
                'team': '' + _this.contest.myTeam,
                'sourceClick': source
            });
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
            alertService.alert({
                'type': 'SELECT_TEAM_ALERT',
                'additionalInfo': { 'team': _this.contest.teams[_this.contest.myTeam].name }
            }).then(function () {
                if (rankModal) {
                    _this.client.nav.present(rankModal);
                }
            });
        }, function () {
        });
    };
    ContestChartComponent.prototype.switchTeams = function (source) {
        this.joinContest(1 - this.contest.myTeam, source, 'switchTeams');
    };
    ContestChartComponent.prototype.onContestButtonClick = function () {
        if (this.contest.state === 'join') {
            alertService.alert({ 'type': 'SERVER_ERROR_NOT_JOINED_TO_CONTEST' });
        }
        else {
            this.contestButtonClick.emit({ 'contest': this.contest });
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
    ], ContestChartComponent.prototype, "finishedStateButtonText", void 0);
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