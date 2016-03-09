import {Page,NavParams,ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';
import {Question} from '../../objects/objects';

@Page({
  templateUrl: 'build/pages/question-stats/question-stats.html'
})
export class QuestionStatsPage {

  client:Client;
  question:Question;
  chartDataSource:Object;
  viewController:ViewController;

  constructor(params:NavParams, viewController: ViewController) {
    this.client = Client.getInstance();
    this.question = params.data.question;
    this.chartDataSource = params.data.chartDataSource;
    this.viewController = viewController;
  }

  onPageWillEnter() {

    this.client.logEvent('page/questionStats', {'questionId' : this.question._id});

    if (this.chartDataSource) {
      window.FusionCharts.ready(() => {
        var chart = new window.FusionCharts({
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
    this.client.logEvent('quiz/stats/' + (action ? action : 'cancel'));
    this.viewController.dismiss(action);
  }
}
