import {IonicApp, Page, Component,NavController} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Server} from '../../providers/server';
import {ContestPage} from '../contest/contest'
import * as contestsService from '../../providers/contests';

@Page({
  templateUrl: 'build/pages/my-contests/my-contests.html',
  directives: [ContestListComponent]
})

export class MyContestsPage {

  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  server: Server;
  app:IonicApp;
  nav:NavController;

  constructor(app:IonicApp) {
    this.app = app;
    this.nav = this.app.getComponent('nav');
    this.server = Server.getInstance();
  }

  onPageDidEnter() {
    this.app.setTitle(this.server.translate('MY_CONTESTS'));
    this.contestList.refresh();
  }

  onContestSelected(data) {
    contestsService.openContest(this.server, this.nav, data.contest._id);
  }

}
