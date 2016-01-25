var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_1 = require('ionic/ionic');
var core_1 = require('angular2/core');
var contest_list_1 = require('../../components/contest-list/contest-list');
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
var date_picker_1 = require('../../components/date-picker/date-picker');
var MyContestsPage = (function () {
    function MyContestsPage() {
        this.client = client_1.Client.getInstance();
    }
    MyContestsPage.prototype.onPageWillEnter = function () {
        if (this.contestList) {
            this.contestList.refresh();
        }
    };
    MyContestsPage.prototype.onPageDidEnter = function () {
    };
    MyContestsPage.prototype.ngAfterViewInit = function () {
        this.contestList.refresh();
    };
    MyContestsPage.prototype.onContestSelected = function (data) {
        contestsService.openContest(data.contest._id);
    };
    MyContestsPage.prototype.dateSelected = function (theDate) {
        console.log("date selected: " + theDate);
    };
    __decorate([
        core_1.ViewChild(contest_list_1.ContestListComponent), 
        __metadata('design:type', contest_list_1.ContestListComponent)
    ], MyContestsPage.prototype, "contestList", void 0);
    MyContestsPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/my-contests/my-contests.html',
            directives: [contest_list_1.ContestListComponent, date_picker_1.DatePickerComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], MyContestsPage);
    return MyContestsPage;
})();
exports.MyContestsPage = MyContestsPage;
