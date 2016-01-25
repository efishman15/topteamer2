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
var PurchaseSuccessPage = (function () {
    function PurchaseSuccessPage(params) {
        this.client = client_1.Client.getInstance();
        this.params = params;
    }
    PurchaseSuccessPage.prototype.onPageWillEnter = function () {
        this.unlockText = this.client.translate(client.session.features[this.params.data.featurePurchased].unlockText);
    };
    PurchaseSuccessPage.prototype.proceed = function () {
        this.client.nav.pop();
        if (!this.client.nav.canGoBack()) {
        }
    };
    PurchaseSuccessPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/purchase-sucess/purchase-success.html'
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.NavParams !== 'undefined' && ionic_1.NavParams) === 'function' && _a) || Object])
    ], PurchaseSuccessPage);
    return PurchaseSuccessPage;
    var _a;
})();
exports.PurchaseSuccessPage = PurchaseSuccessPage;
