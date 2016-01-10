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
var contest_leaders_1 = require('../../components/contest-leaders/contest-leaders');
var simple_tabs_1 = require('../../components/simple-tabs/simple-tabs');
var simple_tab_1 = require('../../components/simple-tab/simple-tab');
var core_1 = require('angular2/core');
var client_1 = require('../../providers/client');
var ionic_2 = require("ionic-framework/ionic");
var ContestParticipantsPage = (function () {
    function ContestParticipantsPage(params) {
        // set the root pages for each tab
        this.contest = params.data.contest;
        this.source = params.data.source;
        this.client = client_1.Client.getInstance();
        this.client.setPageTitle('CONTEST_LEADERS');
    }
    ContestParticipantsPage.prototype.onPageDidEnter = function () {
        this.showContestParticipants();
    };
    ContestParticipantsPage.prototype.showContestParticipants = function () {
        FlurryAgent.logEvent('contest/participants/' + this.source + '/leaderboard/all');
        this.contestLeadersComponent.showContestParticipants(this.contest._id);
    };
    ContestParticipantsPage.prototype.showTeamParticipants = function (teamId) {
        FlurryAgent.logEvent('contest/participants/' + this.source + '/leaderboard/team' + teamId);
        this.contestLeadersComponent.showContestParticipants(this.contest._id, teamId);
    };
    __decorate([
        core_1.ViewChild(contest_leaders_1.ContestLeadersComponent), 
        __metadata('design:type', contest_leaders_1.ContestLeadersComponent)
    ], ContestParticipantsPage.prototype, "contestLeadersComponent", void 0);
    ContestParticipantsPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/contest-participants/contest-participants.html',
            directives: [simple_tabs_1.SimpleTabsComponent, simple_tab_1.SimpleTabComponent, contest_leaders_1.ContestLeadersComponent]
        }), 
        __metadata('design:paramtypes', [ionic_2.NavParams])
    ], ContestParticipantsPage);
    return ContestParticipantsPage;
})();
exports.ContestParticipantsPage = ContestParticipantsPage;
