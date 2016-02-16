import {IonicApp, Page, Component, NavController} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {PlayerInfoComponent} from '../../components/player-info/player-info';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';

@Page({
  templateUrl: 'build/pages/running-contests/running-contests.html',
  directives: [ContestListComponent,PlayerInfoComponent]
})

export class RunningContestsPage {

  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  client: Client;

  constructor() {
    this.client = Client.getInstance();
  }

  onPageWillEnter() {
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
}
