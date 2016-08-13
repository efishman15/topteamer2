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
var client_1 = require('../../providers/client');
var ACTION_UPDATE_CONTEST = 'contestUpdated';
var ACTION_REMOVE_CONTEST = 'contestRemoved';
var ACTION_FORCE_REFRESH = 'forceRefresh';
var MainTabsPage = (function () {
    function MainTabsPage() {
        var _this = this;
        this.client = client_1.Client.getInstance();
        // set the root pages for each tab
        this.rootMyContestsPage = this.client.getPage('MyContestsPage');
        this.rootRunningContestsPage = this.client.getPage('RunningContestsPage');
        this.rootLeaderboardsPage = this.client.getPage('LeaderboardsPage');
        this.client.events.subscribe('topTeamer:contestCreated', function () {
            _this.handleContestCreated();
        });
        this.client.events.subscribe('topTeamer:contestUpdated', function (eventData) {
            _this.handleContestUpdated(eventData[0], eventData[1], eventData[2]);
        });
        this.client.events.subscribe('topTeamer:contestRemoved', function (eventData) {
            _this.handleContestRemoved(eventData[0], eventData[1]);
        });
        this.client.events.subscribe('topTeamer:languageChanged', function (eventData) {
            if (eventData[0]) {
                window.location.reload();
            }
            else {
                //Just refresh the contests to reflect the new language
                _this.publishActionToTab(0, ACTION_FORCE_REFRESH);
                _this.publishActionToTab(1, ACTION_FORCE_REFRESH);
                _this.publishActionToTab(2, ACTION_FORCE_REFRESH);
            }
        });
        this.client.events.subscribe('topTeamer:switchedToFacebook', function (eventData) {
            //Just refresh the contests to reflect the new language
            _this.publishActionToTab(0, ACTION_FORCE_REFRESH);
            _this.publishActionToTab(1, ACTION_FORCE_REFRESH);
            _this.publishActionToTab(2, ACTION_FORCE_REFRESH);
        });
        this.client.events.subscribe('topTeamer:serverPopup', function (eventData) {
            _this.client.showModalPage('ServerPopupPage', { 'serverPopup': eventData[0] });
        });
        this.client.events.subscribe('topTeamer:noPersonalContests', function () {
            _this.mainTabs.select(1); //Switch to "Running contests"
        });
        this.client.events.subscribe('topTeamer:showLeadingContests', function () {
            _this.mainTabs.select(1); //Switch to "Running contests"
        });
    }
    MainTabsPage.prototype.ionViewDidEnter = function () {
        //Events here could be serverPopup just as the app loads - the page should be fully visible
        this.client.processInternalEvents();
        //Came from external deep linking - only for the case the the appp is running
        if (this.client.deepLinkContestId) {
            var contestId = this.client.deepLinkContestId;
            this.client.deepLinkContestId = null;
            this.client.displayContestById(contestId).then(function () {
            }, function () {
            });
        }
    };
    MainTabsPage.prototype.publishActionToTab = function (index, action, param) {
        var eventName = 'topTeamer:';
        switch (index) {
            case 0:
                eventName += 'myContests';
                break;
            case 1:
                eventName += 'runningContests';
                break;
            case 2:
                eventName += 'recentlyFinishedContests';
                break;
        }
        eventName += ':' + action;
        if (param) {
            this.client.events.publish(eventName, param);
        }
        else {
            this.client.events.publish(eventName);
        }
    };
    MainTabsPage.prototype.handleContestCreated = function () {
        //Force refresh my contests
        this.publishActionToTab(0, ACTION_FORCE_REFRESH);
    };
    MainTabsPage.prototype.handleContestUpdated = function (contest, previousStatus, currentStatus) {
        if (previousStatus === currentStatus) {
            //Was finished and remained finished, or was running and still running...
            switch (currentStatus) {
                case 'starting':
                    //For admins - future contests - appear only in "my Contests"
                    this.publishActionToTab(0, ACTION_UPDATE_CONTEST, contest);
                    break;
                case 'running':
                    //Appears in my contests / running contests
                    this.publishActionToTab(0, ACTION_UPDATE_CONTEST, contest);
                    this.publishActionToTab(1, ACTION_UPDATE_CONTEST, contest);
                    break;
                case 'finished':
                    //Appears in recently finished contests
                    this.publishActionToTab(2, ACTION_UPDATE_CONTEST, contest);
                    break;
            }
        }
        else {
            switch (previousStatus) {
                case 'starting':
                    if (currentStatus === 'running') {
                        //Update my contests
                        this.publishActionToTab(0, ACTION_UPDATE_CONTEST, contest);
                        //Refresh running contests - might appear there
                        this.publishActionToTab(1, ACTION_FORCE_REFRESH);
                    }
                    else {
                        //finished
                        //Remove from my contests
                        this.publishActionToTab(0, ACTION_REMOVE_CONTEST, contest._id);
                        //Refresh recently finished contests
                        this.publishActionToTab(2, ACTION_FORCE_REFRESH);
                    }
                    break;
                case 'running':
                    if (currentStatus === 'starting') {
                        //Update my contests
                        this.publishActionToTab(0, ACTION_UPDATE_CONTEST, contest);
                        //Remove from running contests
                        this.publishActionToTab(1, ACTION_REMOVE_CONTEST, contest._id);
                    }
                    else {
                        //finished
                        //Remove from my contests and from running contests
                        this.publishActionToTab(0, ACTION_REMOVE_CONTEST, contest._id);
                        this.publishActionToTab(1, ACTION_REMOVE_CONTEST, contest._id);
                        //Refresh recently finished contests
                        this.publishActionToTab(2, ACTION_FORCE_REFRESH);
                    }
                    break;
                case 'finished':
                    //Remove from finished contests
                    this.publishActionToTab(2, ACTION_REMOVE_CONTEST, contest._id);
                    if (currentStatus === 'starting') {
                        //Refresh my contests
                        this.publishActionToTab(0, ACTION_FORCE_REFRESH);
                    }
                    else {
                        //running
                        //Refresh my contests
                        this.publishActionToTab(0, ACTION_FORCE_REFRESH);
                        //Refresh running contests
                        this.publishActionToTab(1, ACTION_FORCE_REFRESH);
                    }
                    break;
            }
        }
    };
    MainTabsPage.prototype.handleContestRemoved = function (contestId, finishedContest) {
        if (!finishedContest) {
            //Try to remove it from 'my contests' and 'running contests' tabs
            this.publishActionToTab(0, ACTION_REMOVE_CONTEST, contestId);
            this.publishActionToTab(1, ACTION_REMOVE_CONTEST, contestId);
        }
        else {
            //Try to remove it from the recently finished tab
            this.publishActionToTab(2, ACTION_REMOVE_CONTEST, contestId);
        }
    };
    __decorate([
        core_1.ViewChild(ionic_angular_1.Tabs), 
        __metadata('design:type', ionic_angular_1.Tabs)
    ], MainTabsPage.prototype, "mainTabs", void 0);
    MainTabsPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/main-tabs/main-tabs.html'
        }), 
        __metadata('design:paramtypes', [])
    ], MainTabsPage);
    return MainTabsPage;
})();
exports.MainTabsPage = MainTabsPage;
//# sourceMappingURL=main-tabs.js.map