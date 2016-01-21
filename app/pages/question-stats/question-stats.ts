import {Page,NavParams,Events} from 'ionic/ionic';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/question-stats/question-stats.html'
})
export class QuestionStatsPage {

  client:Client;
  question:Object;
  chartDataSource:Object;
  events: Events;

  constructor(params:NavParams, events: Events) {
    this.client = Client.getInstance();
    this.question = params.data.question;
    this.chartDataSource = params.data.chartDataSource;
    this.events = events;
  }

  onPageWillEnter() {
    FusionCharts.ready(() => {
      var chart = new FusionCharts({
        type: "pie2d",
        renderAt: 'questionChart',
        width: this.client.settings.charts.size.width,
        height: this.client.settings.charts.size.height,
        dataFormat: 'json',
        dataSource: this.chartDataSource
      });

      chart.render();

    });
  }

  dismiss(action) {
    this.close();
    this.events.publish('topTeamer:questionStatsClosed', action)
  }
}
