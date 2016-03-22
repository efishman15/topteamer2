"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var client_1 = require('../../providers/client');
var objects_1 = require('../../objects/objects');
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
                _this.teamSelected.emit({ 'teamId': teamId, 'source': 'bar', 'contest': _this.contest });
                _this.chartTeamEventHandled = true;
            },
            'dataLabelClick': function (eventObj, dataObj) {
                var teamId = dataObj.dataIndex;
                if (_this.client.currentLanguage.direction === 'rtl') {
                    teamId = 1 - teamId;
                }
                _this.teamSelected.emit({ 'teamId': teamId, 'source': 'label', 'contest': _this.contest });
                _this.chartTeamEventHandled = true;
            },
            'chartClick': function (eventObj, dataObj) {
                if (!_this.chartTeamEventHandled) {
                    _this.selectContest();
                }
                _this.chartTeamEventHandled = false;
            }
        };
        this.client = client_1.Client.getInstance();
    }
    ContestChartComponent.prototype.selectContest = function () {
        this.contestSelected.emit({ 'contest': this.contest });
    };
    ContestChartComponent.prototype.ngOnInit = function () {
        this.initChart();
    };
    ContestChartComponent.prototype.initChart = function () {
        var _this = this;
        if (!this.chart) {
            window.FusionCharts.ready(function () {
                _this.chart = new window.FusionCharts({
                    type: _this.client.settings.charts.contest.type,
                    renderAt: _this.id + '-container',
                    width: _this.client.settings.charts.contest.size.width,
                    height: _this.client.settings.charts.contest.size.height,
                    dataFormat: 'json',
                    dataSource: _this.contest.chartControl,
                    events: _this.events
                });
                _this.chart.render();
            });
        }
    };
    ContestChartComponent.prototype.refresh = function (chartControl) {
        if (this.chart) {
            this.chart.setJSONData(chartControl);
        }
        else {
            this.contest.chartControl = chartControl;
            this.initChart();
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
}());
exports.ContestChartComponent = ContestChartComponent;
