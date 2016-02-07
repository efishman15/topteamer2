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

    console.log('RunningContestsPage:constructor')

    this.client.events.subscribe('topTeamer:contestCreated', (eventData) => {
      if (this.client.nav.isActive(RunningContestsPage)) {
        console.log('contest created - refreshing list');
        this.contestList.refresh();
      }
    });

    this.client.events.subscribe('topTeamer:contestRemoved', () => {
      if (this.client.nav.isActive(RunningContestsPage)) {
        console.log('contest removed - refreshing list');
        this.contestList.refresh();
      }
    });

  }

  onPageWillEnter() {
    if (this.contestList) {
      this.contestList.refresh();
    }
  }

  onContestSelected(data) {
    contestsService.openContest(data.contest._id);
  }

}
