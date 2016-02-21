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
var client_1 = require('../../providers/client');
var login_1 = require('../login/login');
var facebookService = require('../../providers/facebook');
var SettingsPage = (function () {
    function SettingsPage() {
        this.client = client_1.Client.getInstance();
    }
    SettingsPage.prototype.toggleSound = function () {
        this.client.toggleSound();
    };
    SettingsPage.prototype.switchLanguage = function () {
        var _this = this;
        this.client.switchLanguage(this.client.currentLanguage.value).then(function () {
            _this.client.session.settings.language = _this.client.user.settings.language;
        });
    };
    SettingsPage.prototype.logout = function () {
        var _this = this;
        facebookService.logout().then(function (response) {
            _this.client.logout();
            _this.client.nav.pop().then(function () {
                _this.client.nav.setRoot(login_1.LoginPage);
            });
        });
    };
    SettingsPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/settings/settings.html'
        }), 
        __metadata('design:paramtypes', [])
    ], SettingsPage);
    return SettingsPage;
})();
exports.SettingsPage = SettingsPage;
