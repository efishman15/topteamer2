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
var soundService = require('../../providers/sound');
var NewRankPage = (function () {
    function NewRankPage(params, viewController) {
        this.client = client_1.Client.getInstance();
        this.xpProgress = params.data.xpProgress;
        this.viewController = viewController;
    }
    NewRankPage.prototype.onPageWillEnter = function () {
        FlurryAgent.logEvent('page/newRank', { 'rank': this.client.session.rank });
    };
    NewRankPage.prototype.onPageDidEnter = function () {
        soundService.play('audio/finish_great_1');
    };
    NewRankPage.prototype.dismiss = function (okPressed) {
        this.viewController.dismiss(okPressed);
    };
    NewRankPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/new-rank/new-rank.html'
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.NavParams !== 'undefined' && ionic_1.NavParams) === 'function' && _a) || Object, (typeof (_b = typeof ionic_1.ViewController !== 'undefined' && ionic_1.ViewController) === 'function' && _b) || Object])
    ], NewRankPage);
    return NewRankPage;
    var _a, _b;
})();
exports.NewRankPage = NewRankPage;
