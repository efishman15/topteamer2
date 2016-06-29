import {Component,ViewChild} from '@angular/core';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Client} from '../../providers/client';
import {Contest} from '../../objects/objects';

@Component({
  templateUrl: 'build/pages/my-contests/my-contests.html',
  directives: [ContestListComponent]
})

export class MyContestsPage {

  @ViewChild(ContestListComponent) contestList:ContestListComponent;
  client:Client;
  pageLoaded:boolean;

  constructor() {
    this.client = Client.getInstance();
  }

  ionViewWillEnter() {
    this.client.logEvent('page/myContests');
    if (this.contestList) {
      this.refreshList().then(() => {
        if (this.contestList.contests.length === 0 && !this.pageLoaded) {
          //On load only - switch to "running contests" if no personal contests
          this.client.events.publish('topTeamer:noPersonalContests');
        }
        this.pageLoaded = true;
      });
    }
  }

  onContestSelected(data) {
    this.client.displayContest(data.contest._id);
  }

  refreshList(forceRefresh? : boolean) {
    return this.contestList.refresh(forceRefresh);
  }

  onResize() {
    this.contestList.onResize();
  }
}
