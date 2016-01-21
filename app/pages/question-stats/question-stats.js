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
var QuestionStatsPage = (function () {
    function QuestionStatsPage(params, events) {
        this.client = client_1.Client.getInstance();
        this.question = params.data.question;
        this.chartDataSource = params.data.chartDataSource;
        this.events = events;
    }
    QuestionStatsPage.prototype.onPageWillEnter = function () {
        var _this = this;
        FusionCharts.ready(function () {
            var chart = new FusionCharts({
                type: "pie2d",
                renderAt: 'questionChart',
                width: _this.client.settings.charts.size.width,
                height: _this.client.settings.charts.size.height,
                dataFormat: 'json',
                dataSource: _this.chartDataSource
            });
            chart.render();
        });
    };
    QuestionStatsPage.prototype.dismiss = function (action) {
        this.close();
        this.events.publish('topTeamer:questionStatsClosed', action);
    };
    QuestionStatsPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/question-stats/question-stats.html'
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.NavParams !== 'undefined' && ionic_1.NavParams) === 'function' && _a) || Object, (typeof (_b = typeof ionic_1.Events !== 'undefined' && ionic_1.Events) === 'function' && _b) || Object])
    ], QuestionStatsPage);
    return QuestionStatsPage;
    var _a, _b;
})();
exports.QuestionStatsPage = QuestionStatsPage;