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
var QuestionStatsPage = (function () {
    function QuestionStatsPage(params, viewController) {
        this.client = client_1.Client.getInstance();
        this.question = params.data.question;
        this.chartDataSource = params.data.chartDataSource;
        this.viewController = viewController;
    }
    QuestionStatsPage.prototype.onPageWillEnter = function () {
        var _this = this;
        this.client.logEvent('page/questionStats', { 'questionId': this.question._id });
        if (this.chartDataSource) {
            window.FusionCharts.ready(function () {
                var chart = new window.FusionCharts({
                    type: _this.client.settings.charts.questionStats.type,
                    renderAt: 'questionChart',
                    width: _this.client.settings.charts.questionStats.size.width,
                    height: _this.client.settings.charts.questionStats.size.height,
                    dataFormat: 'json',
                    dataSource: _this.chartDataSource
                });
                chart.render();
            });
        }
    };
    QuestionStatsPage.prototype.dismiss = function (action) {
        this.client.logEvent('quiz/stats/' + (action ? action : 'cancel'));
        this.viewController.dismiss(action);
    };
    QuestionStatsPage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/question-stats/question-stats.html'
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavParams, ionic_angular_1.ViewController])
    ], QuestionStatsPage);
    return QuestionStatsPage;
})();
exports.QuestionStatsPage = QuestionStatsPage;
//# sourceMappingURL=question-stats.js.map