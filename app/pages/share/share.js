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
var SharePage = (function () {
    function SharePage(params) {
        this.client = client_1.Client.getInstance();
        if (params && params.data) {
            this.contest = params.data.contest;
        }
        this.shareVariables = shareService.getVariables(this.contest);
    }
    SharePage.prototype.onPageWillEnter = function () {
        if (this.contest) {
            this.client.logEvent('page/share', { 'contestId': this.contest._id });
        }
        else {
            this.client.logEvent('page/share');
        }
    };
    SharePage.prototype.share = function (network) {
        console.log('network=' + network.name + ', url=' + network.url);
        window.open(network.url.format({ url: this.shareVariables.shareUrl, subject: this.shareVariables.shareSubject, emailBody: this.shareVariables.shareBodyEmail }), '_blank');
        this.client.logEvent('share/web/' + network.name);
    };
    SharePage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/share/share.html'
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavParams])
    ], SharePage);
    return SharePage;
})();
exports.SharePage = SharePage;
