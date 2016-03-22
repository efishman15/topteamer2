import {Component, Input, EventEmitter, Output} from 'angular2/core';
import {Client} from '../../providers/client';
import {Contest} from '../../objects/objects';

@Component({
  selector: 'contest-chart',
  templateUrl: 'build/components/contest-chart/contest-chart.html'
})

export class ContestChartComponent {

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
      this.teamSelected.emit({'teamId': teamId, 'source': 'bar', 'contest': this.contest});
      this.chartTeamEventHandled = true;
    },
    'dataLabelClick': (eventObj, dataObj) => {
      var teamId = dataObj.dataIndex;
      if (this.client.currentLanguage.direction === 'rtl') {
        teamId = 1 - teamId;
      }
      this.teamSelected.emit({'teamId': teamId, 'source': 'label', 'contest': this.contest});
      this.chartTeamEventHandled = true;
    },
    'chartClick': (eventObj, dataObj) => {
      if (!this.chartTeamEventHandled) {
        this.selectContest();
      }
      this.chartTeamEventHandled = false;
    }
  };

  constructor() {
    this.client = Client.getInstance();
  }

  selectContest() {
    this.contestSelected.emit({'contest': this.contest})
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
          width: this.client.settings.charts.contest.size.width,
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
