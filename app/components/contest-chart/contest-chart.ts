import {Component, Input, EventEmitter, Output} from 'angular2/core';
import {Client} from '../../providers/client';

@Component({
  selector: 'contest-chart',
  templateUrl: 'build/components/contest-chart/contest-chart.html'
})

export class ContestChartComponent {

  @Input() id:Number;
  @Input() width:Number;
  @Input() height:Number;
  @Input() contestChart:Object;

  chartTeamEventHandled:boolean;
  client:Client;
  chart:FusionChart;

  @Output() contestSelected = new EventEmitter();
  @Output() teamSelected = new EventEmitter();

  events:Object = {
    "dataplotClick": (eventObj, dataObj) => {
      var teamId = dataObj.dataIndex;
      if (this.client.currentLanguage.direction === 'rtl') {
        teamId = 1 - teamId;
      }
      this.teamSelected.next({'teamId': teamId, 'source': 'bar', 'contest': this.contestChart.contest});
      this.chartTeamEventHandled = true;
    },
    "dataLabelClick": (eventObj, dataObj) => {
      var teamId = dataObj.dataIndex;
      if (this.client.currentLanguage.direction === 'rtl') {
        teamId = 1 - teamId;
      }
      this.teamSelected.next({'teamId': teamId, 'source': 'label', 'contest': this.contestChart.contest});
      this.chartTeamEventHandled = true;
    },
    "chartClick": (eventObj, dataObj) => {
      if (!this.chartTeamEventHandled) {
        this.contestSelected.next({'contest': this.contestChart.contest})
      }
      this.chartTeamEventHandled = false;
    }
  };

  constructor() {
    this.client = Client.getInstance();
  }

  ngOnInit() {
    FusionCharts.ready(() => {
      this.chart = new FusionCharts({
        type: "column2d",
        renderAt: this.id + '-container',
        width: this.width,
        height: this.height,
        dataFormat: 'json',
        dataSource: this.contestChart,
        events: this.events
      });

      this.chart.render();

    });

  }

  refresh(contestChart: Object) {
    this.chart.setJSONData(contestChart);
  }
}
