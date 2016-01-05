import {Component, Input} from 'angular2/core';

@Component({
  selector: 'contest-chart',
  templateUrl: 'build/components/contest-chart/contest-chart.html'
})

export class ContestChartComponent {

  @Input() id:Number;
  @Input() width:Number;
  @Input() height:Number;
  @Input() contestChart:Object;
  @Input() events:Object;

  constructor() {

  }

  ngOnInit() {
    FusionCharts.ready(() => {
      var chart = new FusionCharts({
        type: "column2d",
        renderAt: 'fc' + this.id + '-container',
        width: this.width,
        height: this.height,
        dataFormat: 'json',
        dataSource: this.contestChart,
        events: this.events
      }).render();
    });

  }
}
