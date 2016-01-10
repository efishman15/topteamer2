import {IonicApp, Page, Component,NavController} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';

@Page({
  templateUrl: 'build/pages/recently-finished-contests/recently-finished-contests.html',
  directives: [ContestListComponent]
})

export class RecentlyFinishedContestsPage {

  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  client: Client;

  constructor() {
    this.client = Client.getInstance();
  }

  onPageDidEnter() {
    this.contestList.refresh();
  }

  onContestSelected(data) {
    contestsService.openContest(data.contest._id);
  }

}
