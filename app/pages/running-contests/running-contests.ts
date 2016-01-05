import {IonicApp, Page, Component} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Server} from '../../providers/server';

@Page({
  templateUrl: 'build/pages/running-contests/running-contests.html',
  directives: [ContestListComponent]
})

export class RunningContestsPage {

  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  server: Server;
  app:IonicApp;

  constructor(app:IonicApp) {
    this.app = app;
    this.server = Server.getInstance();
  }

  onPageDidEnter() {
    this.app.setTitle(this.server.translate('RUNNING_CONTESTS'));
    this.contestList.refresh();
  }
}
