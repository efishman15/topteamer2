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
var analyticsService = require('../../providers/analytics');
var connectService = require('../../providers/connect');
var FacebookPostPage = (function () {
    function FacebookPostPage(params, viewController) {
        this.viewController = viewController;
        this.client = client_1.Client.getInstance();
        this.quizResults = params.data.quizResults;
    }
    //The only life cycle eve currently called in modals
    FacebookPostPage.prototype.ngAfterViewInit = function () {
        analyticsService.track('page/facebookPost', { 'contestId': this.quizResults.contest._id, 'story': this.quizResults.data.clientKey });
    };
    FacebookPostPage.prototype.post = function () {
        var _this = this;
        analyticsService.track('contest/facebook/post/click');
        connectService.post(this.quizResults.data.facebookPost).then(function () {
            _this.close(true);
        }, function () {
            //Do nothing - user probably canceled or any other error presented by facebook
            //Stay on screen
        });
    };
    FacebookPostPage.prototype.close = function (posted) {
        if (!posted) {
            analyticsService.track('contest/facebook/post/cancel');
        }
        this.viewController.dismiss();
    };
    FacebookPostPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/facebook-post/facebook-post.html'
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavParams, ionic_angular_1.ViewController])
    ], FacebookPostPage);
    return FacebookPostPage;
})();
exports.FacebookPostPage = FacebookPostPage;
//# sourceMappingURL=facebook-post.js.map