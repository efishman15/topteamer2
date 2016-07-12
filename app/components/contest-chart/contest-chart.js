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
var objects_1 = require('../../objects/objects');
var WIDTH_MARGIN = 2;
var ContestChartComponent = (function () {
    function ContestChartComponent() {
        var _this = this;
        this.contestSelected = new core_1.EventEmitter();
        this.teamSelected = new core_1.EventEmitter();
        this.events = {
            'dataplotClick': function (eventObj, dataObj) {
                var teamId = dataObj.dataIndex;
                if (_this.client.currentLanguage.direction === 'rtl') {
                    teamId = 1 - teamId;
                }
                _this.onTeamSelected(teamId, 'bar');
                _this.chartTeamEventHandled = true;
            },
            'dataLabelClick': function (eventObj, dataObj) {
                var teamId = dataObj.dataIndex;
                if (_this.client.currentLanguage.direction === 'rtl') {
                    teamId = 1 - teamId;
                }
                _this.onTeamSelected(teamId, 'label');
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
        this.contestSelected.emit({ 'contest': this.contest, 'source': source });
    };
    ContestChartComponent.prototype.onTeamSelected = function (teamId, source) {
        this.teamSelected.emit({ 'teamId': teamId, 'contest': this.contest, 'source': source });
    };
    ContestChartComponent.prototype.ngOnInit = function () {
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
            this.adjustResolution();
        }
        if (this.chart) {
            this.chart.setJSONData(this.contest.dataSource);
        }
        else {
            this.initChart();
        }
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
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], ContestChartComponent.prototype, "id", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', objects_1.Contest)
    ], ContestChartComponent.prototype, "contest", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ContestChartComponent.prototype, "contestSelected", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ContestChartComponent.prototype, "teamSelected", void 0);
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