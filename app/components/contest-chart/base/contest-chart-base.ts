import {Component, Input, EventEmitter, Output} from 'angular2/core';
import {Client} from '../../../providers/client';
import {Contest} from '../../../objects/objects';

@Component({
  selector: 'contest-chart-base',
  templateUrl: 'build/components/contest-chart/base/contest-chart-base.html'
})

export class ContestChartBaseComponent {

  @Input() id:Number;
  @Input() contest:Contest;

  chartTeamEventHandled:boolean;
  client:Client;
  chart:any;

  @Output() contestSelected = new EventEmitter();
  @Output() teamSelected = new EventEmitter();

  events:Object = {
    'dataplotClick': (eventObj, dataObj) => {
      var teamId = dataObj.dataIndex;
      if (this.client.currentLanguage.direction === 'rtl') {
        teamId = 1 - teamId;
      }
      this.onTeamSelected(teamId, 'bar');
      this.chartTeamEventHandled = true;
    },
    'dataLabelClick': (eventObj, dataObj) => {
      var teamId = dataObj.dataIndex;
      if (this.client.currentLanguage.direction === 'rtl') {
        teamId = 1 - teamId;
      }
      this.onTeamSelected(teamId, 'label');
      this.chartTeamEventHandled = true;
    },
    'chartClick': (eventObj, dataObj) => {
      if (!this.chartTeamEventHandled) {
        this.onContestSelected('chart');
      }
      this.chartTeamEventHandled = false;
    }
  };

  constructor() {
    this.client = Client.getInstance();
  }

  onContestSelected(source: string) {
    this.contestSelected.emit({'contest': this.contest, 'source': source});
  }

  onTeamSelected(teamId: number, source: string) {
    this.teamSelected.emit({'teamId': teamId, 'contest': this.contest, 'source': source})
  }

  ngOnInit() {
    this.initChart();
  }

  initChart() {
    if (!this.chart) {
      window.FusionCharts.ready(() => {
        this.chart = new window.FusionCharts({
          type: this.client.settings.charts.contest.type,
          renderAt: this.id + '-container',
          width: this.client.settings.charts.contest.size.width - 2, //To solve pixel issue in pc/smartphone
          height: this.client.settings.charts.contest.size.height,
          dataFormat: 'json',
          dataSource: this.contest.chartControl,
          events: this.events
        });

        this.chart.render();

      });
    }
  }

  refresh(chartControl: any) {
    if (this.chart) {
      this.chart.setJSONData(chartControl);
    }
    else {
      this.contest.chartControl = chartControl;
      this.initChart();
    }
  }
}
