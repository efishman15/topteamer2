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
        this.client.events.subscribe('topTeamer:languageChanged', function () {
            window.location.reload();
        });
        this.client.events.subscribe('topTeamer:serverPopup', function (eventData) {
            _this.client.showModalPage('ServerPopupPage', { 'serverPopup': eventData[0] });
        });
        this.client.events.subscribe('topTeamer:noPersonalContests', function () {
            _this.mainTabs.select(1); //Switch to "Running contests"
        });
    }
    MainTabsPage.prototype.ionViewDidEnter = function () {
        //Should occur only once - and AFTER top toolbar received it's height
        if (!this.playerInfoInitiated) {
            this.client.initPlayerInfo();
            this.client.initXp();
            this.playerInfoInitiated = true;
        }
        //Events here could be serverPopup just as the app loads - the page should be fully visible
        this.client.processInternalEvents();
        //Came from external deep linking
        if (this.client.deepLinkContestId) {
            var contestId = this.client.deepLinkContestId;
            this.client.deepLinkContestId = null;
            this.client.displayContest(contestId);
        }
    };
    MainTabsPage.prototype.onResize = function () {
        var selectedPage = this.mainTabs.getSelected().first();
        if (selectedPage.instance && selectedPage.instance.onResize) {
            selectedPage.instance.onResize();
        }
    };
    MainTabsPage.prototype.getTabPage = function (index) {
        var viewController = this.mainTabs.getByIndex(index).first();
        return viewController.instance;
    };
    MainTabsPage.prototype.handleContestCreated = function () {
        //Force refresh my contests
        this.getTabPage(0).refreshList(true).then(function () {
        }, function () {
        });
    };
    MainTabsPage.prototype.handleContestUpdated = function (contest, previousStatus, currentStatus) {
        if (previousStatus === currentStatus) {
            //Was finished and remained finished, or was running and still running...
            switch (currentStatus) {
                case 'starting':
                    //For admins - future contests - appear only in "my Contests"
                    this.getTabPage(0).contestList.updateContest(contest);
                    break;
                case 'running':
                    //Appears in my contests / running contests
                    this.getTabPage(0).contestList.updateContest(contest);
                    this.getTabPage(1).contestList.updateContest(contest);
                    break;
                case 'finished':
                    //Appears in recently finished contests
                    this.getTabPage(2).contestList.updateContest(contest);
                    break;
            }
        }
        else {
            switch (previousStatus) {
                case 'starting':
                    if (currentStatus === 'running') {
                        //Update my contests
                        this.getTabPage(0).contestList.updateContest(contest);
                        //Refresh running contests - might appear there
                        this.getTabPage(1).refreshList(true).then(function () {
                        }, function () {
                        });
                    }
                    else {
                        //finished
                        //Remove from my contests
                        this.getTabPage(0).contestList.removeContest(contest._id);
                        //Refresh recently finished contests
                        this.getTabPage(2).refreshList(true).then(function () {
                        }, function () {
                        });
                    }
                    break;
                case 'running':
                    if (currentStatus === 'starting') {
                        //Update my contests
                        this.getTabPage(0).contestList.updateContest(contest);
                        //Remove from running contests
                        this.getTabPage(1).contestList.removeContest(contest._id);
                    }
                    else {
                        //finished
                        //Remove from my contests and from running contests
                        this.getTabPage(0).contestList.removeContest(contest._id);
                        this.getTabPage(1).contestList.removeContest(contest._id);
                        //Refresh recently finished contests
                        this.getTabPage(2).refreshList(true).then(function () {
                        }, function () {
                        });
                    }
                    break;
                case 'finished':
                    //Remove from finished contests
                    this.getTabPage(2).contestList.removeContest(contest._id);
                    if (currentStatus === 'starting') {
                        //Refresh my contests
                        this.getTabPage(0).refreshList(true).then(function () {
                        }, function () {
                        });
                    }
                    else {
                        //running
                        //Refresh my contests
                        this.getTabPage(0).refreshList(true).then(function () {
                        }, function () {
                        });
                        //Refresh running contests
                        this.getTabPage(1).refreshList(true).then(function () {
                        }, function () {
                        });
                    }
                    break;
            }
        }
    };
    MainTabsPage.prototype.handleContestRemoved = function (contestId, finishedContest) {
        if (!finishedContest) {
            //Try to remove it from 'my contests' and 'running contests' tabs
            this.getTabPage(0).contestList.removeContest(contestId);
            this.getTabPage(1).contestList.removeContest(contestId);
        }
        else {
            //Try to remove it from the recently finished tab
            this.getTabPage(2).contestList.removeContest(contestId);
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