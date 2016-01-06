import {Component, Input, EventEmitter, Output} from 'angular2/core';

@Component({
  selector: 'contest-chart',
  templateUrl: 'build/components/contest-chart/contest-chart.html'
})

export class ContestChartComponent {

  @Input() id:Number;
  @Input() width:Number;
  @Input() height:Number;
  @Input() contestChart:Object;

  chartTeamEventHandled : boolean;

  @Output() contestSelected = new EventEmitter();
  @Output() teamSelected = new EventEmitter();

  events : Object = {
    "dataplotClick": (eventObj, dataObj) => {
      if (this.contestChart.contest.state === 'join') {
        this.teamSelected.next({'teamId' : dataObj.dataIndex, 'source' : 'bar', 'contest' : this.contestChart.contest});
        this.chartTeamEventHandled = true;
      }
    },
    "dataLabelClick": (eventObj, dataObj) => {
      if (this.contestChart.contest.state === 'join') {
        this.teamSelected.next({'teamId' : dataObj.dataIndex, 'source' : 'label', 'contest' : this.contestChart.contest});
        this.chartTeamEventHandled = true;
      }
    },
    "chartClick": (eventObj, dataObj) => {
      if (!this.chartTeamEventHandled) {
        this.contestSelected.next({'contest' : this.contestChart.contest})
      }
      this.chartTeamEventHandled = false;
    }
  };

  constructor() {

  }

  ngOnInit() {
    FusionCharts.ready(() => {
      var chart = new FusionCharts({
        type: "column2d",
        renderAt: this.id + '-container',
        width: this.width,
        height: this.height,
        dataFormat: 'json',
        dataSource: this.contestChart,
        events: this.events
      }).render();
    });

  }
}
