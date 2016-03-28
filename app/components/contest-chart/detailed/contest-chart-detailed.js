"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var contest_chart_base_1 = require('../base/contest-chart-base');
var ContestChartDetailedComponent = (function (_super) {
    __extends(ContestChartDetailedComponent, _super);
    function ContestChartDetailedComponent() {
        _super.apply(this, arguments);
    }
    ContestChartDetailedComponent.prototype.ngOnInit = function () {
        switch (this.contest.state) {
            case 'play':
                this.playText = this.client.translate('PLAY_FOR_TEAM', { 'team': this.contest.teams[this.contest.myTeam].name });
                break;
            case 'join':
                this.playText = this.client.translate('PLAY_CONTEST');
                break;
        }
    };
    ContestChartDetailedComponent = __decorate([
        core_1.Component({
            selector: 'contest-chart-detailed',
            templateUrl: 'build/components/contest-chart/detailed/contest-chart-detailed.html',
            directives: [contest_chart_base_1.ContestChartBaseComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], ContestChartDetailedComponent);
    return ContestChartDetailedComponent;
}(contest_chart_base_1.ContestChartBaseComponent));
exports.ContestChartDetailedComponent = ContestChartDetailedComponent;
