var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var client_1 = require('../../providers/client');
var core_1 = require('angular2/core');
var ionic_1 = require('ionic/ionic');
var LeadersComponent = (function () {
    function LeadersComponent() {
        this.client = client_1.Client.getInstance();
    }
    LeadersComponent.prototype.showFriends = function (friendsPermissionJustGranted) {
        var _this = this;
        var postData = {};
        if (friendsPermissionJustGranted) {
            postData.friendsPermissionJustGranted = friendsPermissionJustGranted;
        }
        this.client.serverPost('leaderboard/friends', postData).then(function (leaders) {
            _this.leaders = leaders;
        });
    };
    LeadersComponent.prototype.showWeekly = function () {
        var _this = this;
        this.client.serverPost('leaderboard/weekly').then(function (leaders) {
            _this.leaders = leaders;
        });
    };
    //If teamId is not passed - general contest leaderboard is shown
    LeadersComponent.prototype.showContestParticipants = function (contestId, teamId) {
        var _this = this;
        var postData = { 'contestId': contestId };
        if (teamId === 0 || teamId === 1) {
            postData.teamId = teamId;
        }
        this.client.serverPost('leaderboard/contest', postData).then(function (leaders) {
            _this.leaders = leaders;
        });
    };
    LeadersComponent = __decorate([
        core_1.Component({
            selector: 'leaders',
            templateUrl: 'build/components/leaders/leaders.html',
            directives: [ionic_1.List, ionic_1.Item]
        }), 
        __metadata('design:paramtypes', [])
    ], LeadersComponent);
    return LeadersComponent;
})();
exports.LeadersComponent = LeadersComponent;