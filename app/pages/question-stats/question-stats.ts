import {Page,NavParams,ViewController} from 'ionic/ionic';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/question-stats/question-stats.html'
})
export class QuestionStatsPage {

  client:Client;
  question:Object;
  chartDataSource:Object;
  viewController:ViewController;

  constructor(params:NavParams, viewController: ViewController) {
    this.client = Client.getInstance();
    this.question = params.data.question;
    this.chartDataSource = params.data.chartDataSource;
    this.viewController = viewController;
  }

  onPageWillEnter() {

    FlurryAgent.logEvent('page/questionStats', {'questionId' : this.question._id});

    if (this.chartDataSource) {
      FusionCharts.ready(() => {
        var chart = new FusionCharts({
          type: 'pie2d',
          renderAt: 'questionChart',
          width: this.client.settings.charts.size.width,
          height: this.client.settings.charts.size.height,
          dataFormat: 'json',
          dataSource: this.chartDataSource
        });

        chart.render();

      });
    }
  }

  dismiss(action) {
    this.viewController.dismiss(action);
  }
}
