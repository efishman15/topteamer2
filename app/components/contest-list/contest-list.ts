import {Component, Input, ViewChildren, QueryList} from '@angular/core';
import {ContestChartComponent} from '../contest-chart/contest-chart';
import {ContestDetailsComponent} from '../contest-details/contest-details';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import {Contest} from "../../objects/objects";

@Component({
  selector: 'contest-list',
  templateUrl: 'build/components/contest-list/contest-list.html',
  directives: [ContestChartComponent, ContestDetailsComponent],
})

export class ContestListComponent {
  @Input() tab:String;

  @ViewChildren(ContestChartComponent) contestChartComponents:QueryList<ContestChartComponent>;

  contests:Array<Contest>;
  client:Client;
  lastRefreshTime;

  constructor() {
    this.client = Client.getInstance();
    this.lastRefreshTime = 0;
  }

  refresh(forceRefresh?:boolean) {
    return new Promise((resolve, reject) => {
      var now = (new Date()).getTime();

      //Check if refresh frequency reached
      if (now - this.lastRefreshTime < this.client.settings.lists.contests.refreshFrequencyInMilliseconds && !forceRefresh) {
        resolve();
        return;
      }

      contestsService.list(this.tab).then((contests:Array<Contest>) => {
        this.lastRefreshTime = now;
        this.contests = contests;
        resolve();
      }), () => {
        reject();
      };
    });
  }

  onContestSelected(data: any) {
    this.client.logEvent('displayContest',{'contestId' : data.contest._id, 'source': data.source});
    this.client.displayContest(data.contest._id);
  }

  onContestShare(data: any) {
    this.client.logEvent('contestShare',{'contestId' : data.contest._id, 'source': data.source});
    this.client.displayContest(data.contest._id);
  }

  onResize() {
    if (this.contestChartComponents && this.contestChartComponents.length > 0) {
      this.contestChartComponents.forEach((contestChartComponent:ContestChartComponent) => {
        contestChartComponent.onResize();
      });
    }
  }

  findContestIndex(contestId:string) {
    if (this.contests && this.contests.length > 0) {
      for (var i = 0; i < this.contests.length; i++) {
        if (this.contests[i]._id === contestId) {
          return i;
        }
      }
    }
    return -1;
  }

  updateContest(contest:Contest) {
    var index = this.findContestIndex(contest._id);
    if (index > -1) {
      this.contests[index] = contest;
    }
  }

  removeContest(contestId:string) {
    var index = this.findContestIndex(contestId);
    if (index > -1) {
      this.contests.splice(index, 1);
    }
  }
}
