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
var ContestChartComponent = (function () {
    function ContestChartComponent() {
        var _this = this;
        this.contestSelected = new core_1.EventEmitter();
        this.teamSelected = new core_1.EventEmitter();
        this.events = {
            "dataplotClick": function (eventObj, dataObj) {
                if (_this.contestChart.contest.state === 'join') {
                    _this.teamSelected.next({ 'teamId': dataObj.dataIndex, 'source': 'bar', 'contest': _this.contestChart.contest });
                    _this.chartTeamEventHandled = true;
                }
            },
            "dataLabelClick": function (eventObj, dataObj) {
                if (_this.contestChart.contest.state === 'join') {
                    _this.teamSelected.next({ 'teamId': dataObj.dataIndex, 'source': 'label', 'contest': _this.contestChart.contest });
                    _this.chartTeamEventHandled = true;
                }
            },
            "chartClick": function (eventObj, dataObj) {
                if (!_this.chartTeamEventHandled) {
                    _this.contestSelected.next({ 'contest': _this.contestChart.contest });
                }
                _this.chartTeamEventHandled = false;
            }
        };
    }
    ContestChartComponent.prototype.ngOnInit = function () {
        var _this = this;
        FusionCharts.ready(function () {
            var chart = new FusionCharts({
                type: "column2d",
                renderAt: _this.id + '-container',
                width: _this.width,
                height: _this.height,
                dataFormat: 'json',
                dataSource: _this.contestChart,
                events: _this.events
            }).render();
        });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], ContestChartComponent.prototype, "id", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], ContestChartComponent.prototype, "width", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], ContestChartComponent.prototype, "height", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ContestChartComponent.prototype, "contestChart", void 0);
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
