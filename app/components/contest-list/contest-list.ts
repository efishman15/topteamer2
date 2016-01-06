import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {ContestChartComponent} from '../contest-chart/contest-chart';
import {Server} from '../../providers/server';
import * as contestsService from '../../providers/contests';

@Component({
  selector: 'contest-list',
  templateUrl: 'build/components/contest-list/contest-list.html',
  directives: [ContestChartComponent],
})

export class ContestListComponent {
  @Input() tab:String;
  @Output() contestSelected = new EventEmitter();
  @Output() teamSelected = new EventEmitter();

  contests:Array<Object>;
  contestCharts:Array<Object>;
  server:Server;
  events:Object = {
    "chartClick": (eventObj, dataObj) => {
      this.selectContest(eventObj.sender.args.dataSource.contest);
    }
  }

  constructor() {
    this.server = Server.getInstance();
  }

  selectContest(contest:Object) {
    this.select.next(contest);
  }

  refresh() {
    var postData = {'tab': this.tab};
    this.server.post('contests/list', postData).then((contests) => {
      this.contests = contests;
      this.contestCharts = [];
      for(var i=0; i<contests.length; i++) {
        this.contestCharts.push(contestsService.prepareContestChart(contests[i],"ends"));
      }
    });
  }

  onContestSelected(data) {
    this.contestSelected.next(data);
  }

  onTeamSelected(data) {
    this.teamSelected.next(data);
  }

}


