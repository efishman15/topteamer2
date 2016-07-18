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
var facebookService = require('../../providers/facebook');
var LoginPage = (function () {
    function LoginPage() {
        var _this = this;
        this.client = client_1.Client.getInstance();
        this.client.events.subscribe('topTeamer:serverPopup', function (eventData) {
            _this.client.showModalPage('ServerPopupPage', { 'serverPopup': eventData[0] });
        });
    }
    LoginPage.prototype.ionViewLoaded = function () {
        this.client.setPageTitle('GAME_NAME');
    };
    LoginPage.prototype.ionViewWillEnter = function () {
        this.client.logEvent('page/login');
    };
    LoginPage.prototype.ionViewDidEnter = function () {
        //Events here could be serverPopup just as the app loads - the page should be fully visible
        this.client.processInternalEvents();
    };
    LoginPage.prototype.login = function () {
        var _this = this;
        this.client.logEvent('login/facebookLogin');
        facebookService.login().then(function (response) {
            _this.client.facebookServerConnect(response['authResponse']).then(function () {
                _this.client.setRootPage('MainTabsPage');
            }, function () {
            });
        }, function () {
        });
    };
    ;
    LoginPage.prototype.changeLanguage = function (language) {
        this.client.user.settings.language = language;
        localStorage.setItem('language', language);
        this.client.logEvent('login/changeLanguage', { language: language });
    };
    LoginPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/login/login.html'
        }), 
        __metadata('design:paramtypes', [])
    ], LoginPage);
    return LoginPage;
})();
exports.LoginPage = LoginPage;
//# sourceMappingURL=login.js.map