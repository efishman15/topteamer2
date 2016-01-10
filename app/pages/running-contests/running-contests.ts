import {IonicApp, Page, Component, NavController} from 'ionic/ionic';
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

  onPageDidEnter() {
    this.client.setPageTitle('RUNNING_CONTESTS');
    this.contestList.refresh();
  }

  onContestSelected(data) {
    contestsService.openContest(data.contest._id);
  }

}
