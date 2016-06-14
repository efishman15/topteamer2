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
var ContestDetailsComponent = (function () {
    function ContestDetailsComponent() {
        this.contestSelected = new core_1.EventEmitter();
        this.client = client_1.Client.getInstance();
    }
    ContestDetailsComponent.prototype.ngOnInit = function () {
        this.width = this.client.width * this.client.settings.charts.contest.size.widthRatio;
    };
    ContestDetailsComponent.prototype.onContestSelected = function () {
        this.contestSelected.emit({ 'contest': this.contest, 'source': 'contest-details' });
    };
    ContestDetailsComponent.prototype.refresh = function (contest) {
        this.contest = contest;
    };
    ContestDetailsComponent.prototype.onResize = function () {
        var newWidth = this.client.width * this.client.settings.charts.contest.size.widthRatio;
        if (this.width !== newWidth) {
            this.width = newWidth;
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], ContestDetailsComponent.prototype, "id", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', objects_1.Contest)
    ], ContestDetailsComponent.prototype, "contest", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ContestDetailsComponent.prototype, "contestSelected", void 0);
    ContestDetailsComponent = __decorate([
        core_1.Component({
            selector: 'contest-details',
            templateUrl: 'build/components/contest-details/contest-details.html'
        }), 
        __metadata('design:paramtypes', [])
    ], ContestDetailsComponent);
    return ContestDetailsComponent;
})();
exports.ContestDetailsComponent = ContestDetailsComponent;
//# sourceMappingURL=contest-details.js.map