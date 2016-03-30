import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {ContestChartInListComponent} from '../contest-chart/in-list/contest-chart-in-list';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';

@Component({
  selector: 'contest-list',
  templateUrl: 'build/components/contest-list/contest-list.html',
  directives: [ContestChartInListComponent],
})

export class ContestListComponent {
  @Input() tab:String;
  @Output() contestSelected = new EventEmitter();

  contests:Array<Object>;
  client:Client;

  constructor() {
    this.client = Client.getInstance();
  }

  refresh() {
    var postData = {'tab': this.tab};
    contestsService.list(this.tab).then((contests) => {
      this.contests = contests;
    });
  }

  onContestSelected(data) {
    this.contestSelected.emit(data);
  }

}


