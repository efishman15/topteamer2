import {IonicApp, Page, Component, NavController} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Server} from '../../providers/server';
import {ContestPage} from '../contest/contest'

@Page({
  templateUrl: 'build/pages/running-contests/running-contests.html',
  directives: [ContestListComponent]
})

export class RunningContestsPage {

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
    this.app.setTitle(this.server.translate('RUNNING_CONTESTS'));
    this.contestList.refresh();
  }

  onContestSelected(data) {
    this.nav.push(ContestPage, {'contest' : data.contest});
  }

}
