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
var shareService = require('../../providers/share');
var SharePage = (function () {
    function SharePage(params) {
        this.client = client_1.Client.getInstance();
        this.params = params;
        this.shareVariables = shareService.getVariables(this.params.data.contest);
    }
    SharePage.prototype.ionViewWillEnter = function () {
        if (this.params.data.contest) {
            this.client.logEvent('page/share', { 'contestId': this.params.data.contest._id, 'source': this.params.data.source });
        }
        else {
            this.client.logEvent('page/share', { 'source': this.params.data.source });
        }
    };
    SharePage.prototype.webShare = function (network) {
        window.open(network.url.format({ url: this.shareVariables.shareUrl, subject: this.shareVariables.shareSubject, emailBody: this.shareVariables.shareBodyEmail }), '_blank');
        this.client.logEvent('share/web/' + network.name);
    };
    SharePage.prototype.mobileShare = function (appName) {
        shareService.mobileShare(appName, this.params.data.contest);
    };
    SharePage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/share/share.html'
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavParams])
    ], SharePage);
    return SharePage;
})();
exports.SharePage = SharePage;
//# sourceMappingURL=share.js.map