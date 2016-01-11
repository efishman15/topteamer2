import {IonicApp, Page, Component,NavController} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Client} from '../../providers/client';
import {ContestPage} from '../contest/contest'
import * as contestsService from '../../providers/contests';
import {InnerHtmlComponent} from '../../components/inner-html/inner-html'

@Page({
  templateUrl: 'build/pages/my-contests/my-contests.html',
  directives: [ContestListComponent,InnerHtmlComponent]
})

export class MyContestsPage {

  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  client: Client;

  str: string = '<strong>This is a strong text</strong>';

  constructor() {
    this.client = Client.getInstance();
  }

  onPageWillEnter() {
    this.client.setPageTitle('MY_CONTESTS');
    if (this.contestList) {
      this.contestList.refresh();
    }
  }

  onPageDidEnter() {
  }

  ngAfterViewInit() {
    this.contestList.refresh();
  }

  onContestSelected(data) {
    contestsService.openContest(data.contest._id);
  }

}
