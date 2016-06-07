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
var WIDTH_MARGIN = 2;
var QuestionStatsPage = (function () {
    function QuestionStatsPage(params, viewController) {
        this.client = client_1.Client.getInstance();
        this.question = params.data.question;
        this.chartDataSource = params.data.chartDataSource;
        this.viewController = viewController;
    }
    //The only life cycle eve currently called in modals
    QuestionStatsPage.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (this.chartDataSource) {
            this.width = this.client.width * this.client.settings.charts.questionStats.size.widthRatio;
            this.height = this.client.height * this.client.settings.charts.questionStats.size.heightRatio;
            //Adjust fonts to pixel ratio
            this.chartDataSource.chart.legendItemFontSize = this.client.adjustPixelRatio(this.chartDataSource.chart.legendItemFontSize);
            this.chartDataSource.chart.labelFontSize = this.client.adjustPixelRatio(this.chartDataSource.chart.labelFontSize);
            window.FusionCharts.ready(function () {
                _this.chart = new window.FusionCharts({
                    type: _this.client.settings.charts.questionStats.type,
                    renderAt: 'questionChart',
                    width: _this.width - WIDTH_MARGIN,
                    height: _this.height,
                    dataFormat: 'json',
                    dataSource: _this.chartDataSource
                });
                _this.chart.render();
            });
        }
        this.client.logEvent('page/questionStats', { 'questionId': this.question._id });
    };
    QuestionStatsPage.prototype.onResize = function () {
        var newWidth = this.client.width * this.client.settings.charts.questionStats.size.widthRatio;
        var newHeight = this.client.height * this.client.settings.charts.questionStats.size.heightRatio;
        if (this.width !== newWidth || this.height !== newHeight) {
            this.width = newWidth;
            this.height = newHeight;
            this.chart.resizeTo(this.width - WIDTH_MARGIN, this.height);
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