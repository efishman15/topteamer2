import {Component,ViewChild} from '@angular/core';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Client} from '../../providers/client';

@Component({
  templateUrl: 'build/pages/running-contests/running-contests.html',
  directives: [ContestListComponent]
})

export class RunningContestsPage {

  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  client: Client;

  constructor() {
    this.client = Client.getInstance();
  }

  ionViewWillEnter() {
    this.client.logEvent('page/runningContests');
    if (this.contestList) {
      this.refreshList();
    }
  }

  ngAfterViewInit() {
    this.refreshList();
  }

  onContestSelected(data) {
    this.client.displayContest(data.contest._id);
  }

  refreshList() {
    this.contestList.refresh();
  }

  onResize() {
    this.contestList.onResize();
  }

}
