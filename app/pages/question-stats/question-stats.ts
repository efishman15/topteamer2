import {Page,NavParams,ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';
import {Question} from '../../objects/objects';

const WIDTH_MARGIN: number = 2;

@Page({
  templateUrl: 'build/pages/question-stats/question-stats.html'
})
export class QuestionStatsPage {

  client:Client;
  question:Question;
  chartDataSource:any;
  viewController:ViewController;
  chart: any;
  width: number;
  height: number;

  constructor(params:NavParams, viewController: ViewController) {
    this.client = Client.getInstance();
    this.question = params.data.question;
    this.chartDataSource = params.data.chartDataSource;
    this.viewController = viewController;
  }

  onPageWillEnter() {

    this.client.logEvent('page/questionStats', {'questionId' : this.question._id});

    if (this.chartDataSource) {

      this.width = this.client.width * this.client.settings.charts.questionStats.size.widthRatio;
      this.height = this.client.height * this.client.settings.charts.questionStats.size.heightRatio;

      //Adjust fonts to pixel ratio
      this.chartDataSource.chart.legendItemFontSize = this.client.adjustPixelRatio(this.chartDataSource.chart.legendItemFontSize);
      this.chartDataSource.chart.labelFontSize = this.client.adjustPixelRatio(this.chartDataSource.chart.labelFontSize);

      window.FusionCharts.ready(() => {
        this.chart = new window.FusionCharts({
          type: this.client.settings.charts.questionStats.type,
          renderAt: 'questionChart',
          width: this.width - WIDTH_MARGIN,
          height: this.height,
          dataFormat: 'json',
          dataSource: this.chartDataSource
        });

        this.chart.render();

      });
    }
  }

  onResize() {
    var newWidth = this.client.width * this.client.settings.charts.questionStats.size.widthRatio;
    var newHeight = this.client.height * this.client.settings.charts.questionStats.size.heightRatio;
    if (this.width !== newWidth || this.height !== newHeight) {
      this.width = newWidth;
      this.height = newHeight;
      this.chart.resizeTo(this.width - WIDTH_MARGIN, this.height);
    }
  }

  dismiss(action) {
    this.client.logEvent('quiz/stats/' + (action ? action : 'cancel'));
    this.viewController.dismiss(action);
  }

}
