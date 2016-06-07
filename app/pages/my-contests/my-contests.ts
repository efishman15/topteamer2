import {ViewChild} from '@angular/core';
import {IonicApp, Page, NavController} from 'ionic-angular';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Client} from '../../providers/client';
import {Contest} from '../../objects/objects';

@Page({
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

  onPageWillEnter() {
    this.client.logEvent('page/myContests');
    if (this.contestList) {
      this.refreshList().then(() => {
        this.pageLoaded = true;
      });
    }
  }

  ngAfterViewInit() {
    this.refreshList().then(() => {
      if (this.contestList.contests.length === 0) {
        //On load only - switch to "running contests" if no personal contests
        this.client.events.publish('topTeamer:noPersonalContests');
      }
    });
  }

  onContestSelected(data) {
    this.client.displayContest(data.contest._id);
  }

  refreshList() {
    return this.contestList.refresh();
  }

  onResize() {
    this.contestList.onResize();
  }
}
