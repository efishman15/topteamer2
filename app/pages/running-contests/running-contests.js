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
var contest_list_1 = require('../../components/contest-list/contest-list');
var client_1 = require('../../providers/client');
var RunningContestsPage = (function () {
    function RunningContestsPage() {
        var _this = this;
        this.client = client_1.Client.getInstance();
        this.client.events.subscribe('topTeamer:runningContests:contestUpdated', function (eventData) {
            _this.contestList.updateContest(eventData[0]);
        });
        this.client.events.subscribe('topTeamer:runningContests:contestRemoved', function (eventData) {
            _this.contestList.removeContest(eventData[0]);
        });
        this.client.events.subscribe('topTeamer:runningContests:forceRefresh', function () {
            _this.refreshList(true).then(function () {
            }, function () {
            });
        });
    }
    RunningContestsPage.prototype.ionViewWillEnter = function () {
        this.client.logEvent('page/runningContests');
        this.refreshList().then(function () {
        }, function () {
        });
    };
    RunningContestsPage.prototype.refreshList = function (forceRefresh) {
        return this.contestList.refresh(forceRefresh);
    };
    RunningContestsPage.prototype.doRefresh = function (refresher) {
        this.refreshList(true).then(function () {
            refresher.complete();
        }, function () {
            refresher.complete();
        });
    };
    __decorate([
        core_1.ViewChild(contest_list_1.ContestListComponent), 
        __metadata('design:type', contest_list_1.ContestListComponent)
    ], RunningContestsPage.prototype, "contestList", void 0);
    RunningContestsPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/running-contests/running-contests.html',
            directives: [contest_list_1.ContestListComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], RunningContestsPage);
    return RunningContestsPage;
})();
exports.RunningContestsPage = RunningContestsPage;
//# sourceMappingURL=running-contests.js.map