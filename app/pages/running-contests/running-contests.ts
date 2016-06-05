import {ViewChild} from '@angular/core';
import {IonicApp, Page, NavController} from 'ionic-angular';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/running-contests/running-contests.html',
  directives: [ContestListComponent]
})

export class RunningContestsPage {

  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  client: Client;

  constructor() {
    this.client = Client.getInstance();
  }

  onPageWillEnter() {
    this.client.logEvent('page/runningContests');
    if (this.contestList) {
      this.refreshList();
    }
  }

  ngAfterViewInit() {
    this.refreshList();
  }

  onContestSelected(data) {
    this.client.openPage('ContestPage', {'contestId': data.contest._id});
  }

  refreshList() {
    this.contestList.refresh();
  }

  onResize() {
    this.contestList.onResize();
  }

}
