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
var facebookService = require('../../providers/facebook');
var FacebookPostPage = (function () {
    function FacebookPostPage(params, viewController) {
        this.viewController = viewController;
        this.client = client_1.Client.getInstance();
        this.quizResults = params.data.quizResults;
    }
    FacebookPostPage.prototype.post = function () {
        var _this = this;
        facebookService.post(this.quizResults.data.facebookPost).then(function (response) {
            _this.close();
        }, function (error) {
            FlurryAgent.myLogError('FacebookPostError', 'Error posting: ' + error);
        });
    };
    FacebookPostPage.prototype.close = function () {
        this.viewController.dismiss();
    };
    FacebookPostPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/facebook-post/facebook-post.html'
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.NavParams !== 'undefined' && ionic_1.NavParams) === 'function' && _a) || Object, (typeof (_b = typeof ionic_1.ViewController !== 'undefined' && ionic_1.ViewController) === 'function' && _b) || Object])
    ], FacebookPostPage);
    return FacebookPostPage;
    var _a, _b;
})();
exports.FacebookPostPage = FacebookPostPage;
