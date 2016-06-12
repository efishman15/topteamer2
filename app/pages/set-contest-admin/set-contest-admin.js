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
var ionic_angular_1 = require('ionic-angular');
var date_picker_1 = require('../../components/date-picker/date-picker');
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
var alertService = require('../../providers/alert');
var SetContestAdminPage = (function () {
    function SetContestAdminPage(params, viewController) {
        this.client = client_1.Client.getInstance();
        this.params = params;
        this.viewController = viewController;
        this.showRemoveContest = (this.params.data.mode === 'edit' && this.client.session.isAdmin);
    }
    SetContestAdminPage.prototype.ionViewWillEnter = function () {
        var eventData = { 'mode': this.params.data.mode };
        if (this.params.data.mode === 'edit') {
            eventData['contestId'] = this.params.data.contestLocalCopy._id;
        }
        this.client.logEvent('page/setContestAdmin', eventData);
    };
    SetContestAdminPage.prototype.ionViewDidLeave = function () {
        //For some reason manipulating the numbers turns them to strings in the model
        this.params.data.contestLocalCopy.teams[0].score = parseInt(this.params.data.contestLocalCopy.teams[0].score);
        this.params.data.contestLocalCopy.teams[1].score = parseInt(this.params.data.contestLocalCopy.teams[1].score);
    };
    SetContestAdminPage.prototype.startDateSelected = function (dateSelection) {
        var nowDateWithTime = new Date();
        var nowDateWithoutTime = new Date();
        nowDateWithoutTime.clearTime();
        var nowEpochWithTime = nowDateWithTime.getTime();
        var nowEpochWithoutTime = nowDateWithoutTime.getTime();
        var currentTimeInMilliseconds = nowEpochWithTime - nowEpochWithoutTime;
        if (this.params.data.mode === 'add') {
            if (dateSelection.epochLocal > nowEpochWithoutTime) {
                //Future date - move end date respectfully
                this.params.data.contestLocalCopy.endDate += dateSelection.epochLocal - nowEpochWithoutTime + currentTimeInMilliseconds;
            }
        }
        this.params.data.contestLocalCopy.startDate = dateSelection.epochLocal + currentTimeInMilliseconds;
        if (this.params.data.contestLocalCopy.startDate > this.params.data.contestLocalCopy.endDate) {
            this.params.data.contestLocalCopy.endDate = this.params.data.contestLocalCopy.startDate + 24 * 60 * 60 * 1000; //add additional 24 hours
        }
    };
    SetContestAdminPage.prototype.removeContest = function () {
        var _this = this;
        this.client.logEvent('contest/remove/click', { 'contestId': this.params.data.contestLocalCopy._id });
        alertService.confirm('CONFIRM_REMOVE_TITLE', 'CONFIRM_REMOVE_TEMPLATE', { name: this.params.data.contestLocalCopy.name.long }).then(function () {
            _this.client.logEvent('contest/removed', { 'contestId': _this.params.data.contestLocalCopy._id });
            contestsService.removeContest(_this.params.data.contestLocalCopy._id).then(function () {
                _this.client.events.publish('topTeamer:contestRemoved');
                setTimeout(function () {
                    _this.client.nav.popToRoot({ animate: false });
                }, 1000);
            });
        }, function () {
            //Do nothing on cancel
        });
    };
    SetContestAdminPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/set-contest-admin/set-contest-admin.html',
            directives: [date_picker_1.DatePickerComponent]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavParams, ionic_angular_1.ViewController])
    ], SetContestAdminPage);
    return SetContestAdminPage;
})();
exports.SetContestAdminPage = SetContestAdminPage;
//# sourceMappingURL=set-contest-admin.js.map