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
var contest_chart_in_list_1 = require('../contest-chart/in-list/contest-chart-in-list');
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
var ContestListComponent = (function () {
    function ContestListComponent() {
        this.contestSelected = new core_1.EventEmitter();
        this.client = client_1.Client.getInstance();
    }
    ContestListComponent.prototype.refresh = function () {
        var _this = this;
        var postData = { 'tab': this.tab };
        contestsService.list(this.tab).then(function (contests) {
            _this.contests = contests;
        });
    };
    ContestListComponent.prototype.onContestSelected = function (data) {
        this.contestSelected.emit(data);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], ContestListComponent.prototype, "tab", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ContestListComponent.prototype, "contestSelected", void 0);
    ContestListComponent = __decorate([
        core_1.Component({
            selector: 'contest-list',
            templateUrl: 'build/components/contest-list/contest-list.html',
            directives: [contest_chart_in_list_1.ContestChartInListComponent],
        }), 
        __metadata('design:paramtypes', [])
    ], ContestListComponent);
    return ContestListComponent;
}());
exports.ContestListComponent = ContestListComponent;
//# sourceMappingURL=contest-list.js.map