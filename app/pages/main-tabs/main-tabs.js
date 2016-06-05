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
        this.client.events.subscribe('topTeamer:contestCreated', function (eventData) {
            _this.needToRefreshList = true;
        });
        this.client.events.subscribe('topTeamer:contestRemoved', function () {
            _this.needToRefreshList = true;
        });
        this.client.events.subscribe('topTeamer:contestUpdated', function (eventData) {
            _this.needToRefreshList = true;
        });
        this.client.events.subscribe('topTeamer:languageChanged', function (eventData) {
            _this.needToRefreshList = true;
        });
        this.client.events.subscribe('topTeamer:serverPopup', function (eventData) {
            _this.client.showModalPage('ServerPopupPage', { 'serverPopup': eventData[0] });
        });
        this.client.events.subscribe('topTeamer:noPersonalContests', function (eventData) {
            _this.mainTabs.select(1); //Switch to "Running contests"
        });
    }
    MainTabsPage.prototype.onPageWillEnter = function () {
        if (this.needToRefreshList) {
            var selectedPage = this.mainTabs.getSelected().getActive();
            if (selectedPage.instance.onPageWillEnter) {
                selectedPage.instance.onPageWillEnter();
            }
            this.needToRefreshList = false;
        }
    };
    MainTabsPage.prototype.onPageDidEnter = function () {
        //Should occur only once - and AFTER top toolbar received it's height
        if (!this.playerInfoInitiated) {
            this.client.initPlayerInfo();
            this.client.initXp();
            this.playerInfoInitiated = true;
        }
        //Events here could be serverPopup just as the app loads - the page should be fully visible
        this.client.processInternalEvents();
    };
    MainTabsPage.prototype.onResize = function () {
        var selectedPage = this.mainTabs.getSelected().getActive();
        if (selectedPage.instance && selectedPage.instance.onResize) {
            selectedPage.instance.onResize();
        }
    };
    __decorate([
        core_1.ViewChild(ionic_angular_1.Tabs), 
        __metadata('design:type', ionic_angular_1.Tabs)
    ], MainTabsPage.prototype, "mainTabs", void 0);
    MainTabsPage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/main-tabs/main-tabs.html'
        }), 
        __metadata('design:paramtypes', [])
    ], MainTabsPage);
    return MainTabsPage;
})();
exports.MainTabsPage = MainTabsPage;
//# sourceMappingURL=main-tabs.js.map