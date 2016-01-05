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
var tabs_1 = require('../tabs/tabs');
var server_1 = require('../../providers/server');
var facebookService = require('../../providers/facebook');
var LoginPage = (function () {
    function LoginPage(nav, app) {
        this.nav = nav;
        this.app = app;
        this._server = server_1.Server.getInstance();
    }
    Object.defineProperty(LoginPage.prototype, "server", {
        get: function () {
            return this._server;
        },
        enumerable: true,
        configurable: true
    });
    LoginPage.prototype.login = function () {
        var _this = this;
        facebookService.login().then(function (response) {
            _this.nav.pop(LoginPage);
            _this._server.facebookConnect(response.authResponse).then(function () {
                _this.nav.push(tabs_1.TabsPage);
            });
        });
    };
    ;
    LoginPage.prototype.changeLanguage = function (language) {
        this._server.user.settings.language = language;
        localStorage.setItem('language', language);
    };
    LoginPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/login/login.html'
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.NavController !== 'undefined' && ionic_1.NavController) === 'function' && _a) || Object, (typeof (_b = typeof ionic_1.IonicApp !== 'undefined' && ionic_1.IonicApp) === 'function' && _b) || Object])
    ], LoginPage);
    return LoginPage;
    var _a, _b;
})();
exports.LoginPage = LoginPage;
