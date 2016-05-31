import {Component, Input, EventEmitter, Output} from '@angular/core';
import {Client} from '../../providers/client';
import {Contest} from '../../objects/objects';

const WIDTH_MARGIN: number = 2;

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
  chart: any;

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
      this.width = this.client.width * this.client.settings.charts.contest.size.widthRatio;
      this.height = this.width * this.client.settings.charts.contest.size.heightRatioFromWidth;
      this.adjustResolution();
      window.FusionCharts.ready(() => {
        this.chart = new window.FusionCharts({
          type: this.client.settings.charts.contest.type,
          renderAt: this.id + '-container',
          width: this.width - WIDTH_MARGIN,
          height: this.height,
          dataFormat: 'json',
          dataSource: this.contest.dataSource,
          events: this.events
        });

        this.chart.render();

      });
    }
  }

  refresh(contest?: Contest) {
    if (contest) {
      //new contest object arrived
      this.contest = contest;
      this.adjustResolution();
    }

    if (this.chart) {
      this.chart.setJSONData(this.contest.dataSource);
    }
    else {
      this.initChart();
    }
  }

  onResize() {
    var newWidth = this.client.width * this.client.settings.charts.contest.size.widthRatio;
    if (this.width !== newWidth) {
      this.width = newWidth;
      this.height = this.width * this.client.settings.charts.contest.size.heightRatioFromWidth;
      this.chart.resizeTo(this.width - WIDTH_MARGIN, this.height);
    }
  }

  adjustResolution() {
    this.contest.dataSource.annotations.groups[0].items[0].fontSize = this.client.adjustPixelRatio(this.contest.dataSource.annotations.groups[0].items[0].fontSize);
    this.contest.dataSource.annotations.groups[0].items[1].fontSize = this.client.adjustPixelRatio(this.contest.dataSource.annotations.groups[0].items[1].fontSize);
    var topMarginPercent = this.client.adjustPixelRatio(this.client.settings.charts.contest.size.topMarginPercent,true);

    var netChartHeight = 1 - (topMarginPercent/100);

    var teamsOrder;
    if (this.client.currentLanguage.direction === 'ltr') {
      teamsOrder = [0, 1];
    }
    else {
      teamsOrder = [1, 0];
    }

    //Scores
    this.contest.dataSource.dataset[0].data[0].value = this.contest.teams[teamsOrder[0]].chartValue * netChartHeight;
    this.contest.dataSource.dataset[0].data[1].value = this.contest.teams[teamsOrder[1]].chartValue * netChartHeight;

    //Others (in grey)
    this.contest.dataSource.dataset[1].data[0].value = netChartHeight - this.contest.dataSource.dataset[0].data[0].value;
    this.contest.dataSource.dataset[1].data[1].value = netChartHeight - this.contest.dataSource.dataset[0].data[1].value;

  }
}
