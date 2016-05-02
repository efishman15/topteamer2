import {Component, Input, EventEmitter, Output} from 'angular2/core';
import {Client} from '../../providers/client';
import {Contest} from '../../objects/objects';

@Component({
  selector: 'contest-chart',
  templateUrl: 'build/components/contest-chart/contest-chart.html'
})

export class ContestChartComponent {

  @Input() id:Number;
  @Input() mode:string;
  @Input() contest:Contest;

  chartTeamEventHandled:boolean;
  client:Client;
  width: number;
  height: number;

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
    if (!this.contest.chartControl) {
      this.width = this.client.width * this.client.settings.charts.contest.size.widthRatio;
      this.height = this.width * this.client.settings.charts.contest.size.heightRatioFromWidth;
      var chartComponent = this;
      window.FusionCharts.ready(() => {
        this.contest.chartControl = new window.FusionCharts({
          type: this.client.settings.charts.contest.type,
          renderAt: this.id + '-container',
          width: this.width - 2,
          height: this.height,
          dataFormat: 'json',
          dataSource: this.contest.dataSource,
          events: this.events
        });

        this.contest.chartComponent = chartComponent;
        this.contest.chartControl.render();

      });
    }
  }

  refresh(dataSource: any) {
    if (this.contest.chartControl) {
      this.contest.chartControl.setJSONData(dataSource);
    }
    else {
      this.contest.dataSource = dataSource;
      this.initChart();
    }
  }

  onResize() {
    this.width = this.client.width * this.client.settings.charts.contest.size.widthRatio;
    this.height = this.width * this.client.settings.charts.contest.size.heightRatioFromWidth;
    this.contest.chartControl.resizeTo(this.width - 2, this.height);
  }
}
