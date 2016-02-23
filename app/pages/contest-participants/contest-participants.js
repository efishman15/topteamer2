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
var leaders_1 = require('../../components/leaders/leaders');
var simple_tabs_1 = require('../../components/simple-tabs/simple-tabs');
var simple_tab_1 = require('../../components/simple-tab/simple-tab');
var core_1 = require('angular2/core');
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
var ContestParticipantsPage = (function () {
    function ContestParticipantsPage(params) {
        var _this = this;
        // set the root pages for each tab
        this.source = params.data.source;
        this.client = client_1.Client.getInstance();
        if (params.data.contest) {
            this.contest = params.data.contest;
            this.contestId = params.data.contest._id;
        }
        else {
            this.contestId = params.data.contestId;
            contestsService.getContest(params.data.contestId).then(function (contest) {
                _this.contest = contest;
            });
        }
    }
    ContestParticipantsPage.prototype.onPageWillEnter = function () {
        FlurryAgent.logEvent('page/contestParticipants', { 'contestId': this.contestId });
        if (this.leadersComponent) {
            this.showContestParticipants();
        }
    };
    ContestParticipantsPage.prototype.ngAfterViewInit = function () {
        this.showContestParticipants();
    };
    ContestParticipantsPage.prototype.showContestParticipants = function () {
        var _this = this;
        if (!this.contest) {
            //In case contest has not been loaded yet
            setTimeout(function () {
                _this.showContestParticipants();
            }, 500);
            return;
        }
        FlurryAgent.logEvent('contest/participants/' + this.source + '/leaderboard/all');
        this.leadersComponent.showContestParticipants(this.contest._id);
    };
    ContestParticipantsPage.prototype.showTeamParticipants = function (teamId) {
        FlurryAgent.logEvent('contest/participants/' + this.source + '/leaderboard/team' + teamId);
        this.leadersComponent.showContestParticipants(this.contest._id, teamId);
    };
    __decorate([
        core_1.ViewChild(leaders_1.LeadersComponent), 
        __metadata('design:type', leaders_1.LeadersComponent)
    ], ContestParticipantsPage.prototype, "leadersComponent", void 0);
    ContestParticipantsPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/contest-participants/contest-participants.html',
            directives: [simple_tabs_1.SimpleTabsComponent, simple_tab_1.SimpleTabComponent, leaders_1.LeadersComponent]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.NavParams !== 'undefined' && ionic_1.NavParams) === 'function' && _a) || Object])
    ], ContestParticipantsPage);
    return ContestParticipantsPage;
    var _a;
})();
exports.ContestParticipantsPage = ContestParticipantsPage;
