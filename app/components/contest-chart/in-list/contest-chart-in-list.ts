import {Component, Input, EventEmitter, Output} from 'angular2/core';
import {ContestChartBaseComponent} from '../base/contest-chart-base';

@Component({
  selector: 'contest-chart-in-list',
  templateUrl: 'build/components/contest-chart/in-list/contest-chart-in-list.html',
  directives: [ContestChartBaseComponent]
})

export class ContestChartInListComponent extends ContestChartBaseComponent {

}
