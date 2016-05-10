import {Page,NavParams,ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';
import {Question} from '../../objects/objects';

@Page({
  templateUrl: 'build/pages/question-stats/question-stats.html'
})
export class QuestionStatsPage {

  client:Client;
  question:Question;
  chartDataSource:any;
  viewController:ViewController;
  chart: any;

  constructor(params:NavParams, viewController: ViewController) {
    this.client = Client.getInstance();
    this.question = params.data.question;
    this.chartDataSource = params.data.chartDataSource;
    this.viewController = viewController;
  }

  onPageWillEnter() {

    this.client.logEvent('page/questionStats', {'questionId' : this.question._id});

    if (this.chartDataSource) {

      //Adjust fonts to pixel ratio
      this.chartDataSource.chart.legendItemFontSize = this.client.adjustPixelRatio(this.chartDataSource.chart.legendItemFontSize);
      this.chartDataSource.chart.labelFontSize = this.client.adjustPixelRatio(this.chartDataSource.chart.labelFontSize);

      window.FusionCharts.ready(() => {
        this.chart = new window.FusionCharts({
          type: this.client.settings.charts.questionStats.type,
          renderAt: 'questionChart',
          width: '' + (this.client.settings.charts.questionStats.size.width) * 100 + '%',
          height: '' + (this.client.settings.charts.questionStats.size.height) * 100 + '%',
          dataFormat: 'json',
          dataSource: this.chartDataSource
        });

        this.chart.render();

      });
    }
  }

  dismiss(action) {
    this.client.logEvent('quiz/stats/' + (action ? action : 'cancel'));
    this.viewController.dismiss(action);
  }

  onResize() {
    this.chart.render();
  }

}
