var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_angular_1 = require('ionic-angular');
var client_1 = require('../../providers/client');
var shareService = require('../../providers/share');
var MobileSharePage = (function () {
    function MobileSharePage(params, viewController) {
        this.client = client_1.Client.getInstance();
        this.contest = params.data.contest;
        this.viewController = viewController;
    }
    MobileSharePage.prototype.onPageWillEnter = function () {
        this.client.logEvent('page/mobileShare', { 'contestId': this.contest._id });
    };
    MobileSharePage.prototype.dismiss = function (okPressed) {
        var _this = this;
        this.client.logEvent('contest/popup/share/' + okPressed);
        this.viewController.dismiss(okPressed).then(function () {
            if (okPressed) {
                shareService.share('mobilePopup', _this.contest);
            }
        });
    };
    MobileSharePage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/mobile-share/mobile-share.html'
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavParams, ionic_angular_1.ViewController])
    ], MobileSharePage);
    return MobileSharePage;
})();
exports.MobileSharePage = MobileSharePage;
