import {Component, Input, Output, EventEmitter, ViewChildren, QueryList} from '@angular/core';
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
  @Output() contestSelected = new EventEmitter();

  @ViewChildren(ContestChartComponent) contestChartComponents:QueryList<ContestChartComponent>;
  @ViewChildren(ContestDetailsComponent) contestDetailsComponents:QueryList<ContestDetailsComponent>;

  contests:Array<Contest>;
  client:Client;
  lastRefreshTime;

  constructor() {
    this.client = Client.getInstance();
    this.lastRefreshTime = 0;
  }

  refresh(forceRefresh?: boolean) {
    return new Promise( (resolve, reject) => {
      var now = (new Date()).getTime();

      //Check if refresh frequency reached
      if (now - this.lastRefreshTime < this.client.settings.lists.contests.refreshFrequencyInMilliseconds && !forceRefresh) {
        resolve();
        return;
      }

      contestsService.list(this.tab).then((contests: Array<Contest>) => {
        this.lastRefreshTime = now;
        this.contests = contests;
        this.contestChartComponents.forEach( (contestChartComponent: ContestChartComponent) => {
          contestChartComponent.refresh();
        });
        var i = 0;
        this.contestDetailsComponents.forEach( (contestDetailsComponent: ContestDetailsComponent) => {
          contestDetailsComponent.refresh(contests[i]);
          i++;
        });
        resolve();
      }), () => {
        reject();
      };
    });
  }

  onContestSelected(event: Event) {
    this.contestSelected.emit(event);
  }

  onResize() {
    if (this.contestChartComponents && this.contestChartComponents.length > 0) {
      this.contestChartComponents.forEach( (contestChartComponent: ContestChartComponent) => {
        contestChartComponent.onResize();
      });
      this.contestDetailsComponents.forEach( (contestDetailsComponent: ContestDetailsComponent) => {
        contestDetailsComponent.onResize();
      });
    }
  }
}


