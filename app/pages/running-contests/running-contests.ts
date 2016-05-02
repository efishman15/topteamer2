import {IonicApp, Page, NavController} from 'ionic-angular';
import {ViewChild} from 'angular2/core';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';

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
    contestsService.openContest(data.contest._id);
  }

  refreshList() {
    this.contestList.refresh();
  }

  onResize() {
    this.contestList.onResize();
  }

}
