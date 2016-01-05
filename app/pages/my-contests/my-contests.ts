import {IonicApp, Page, Component} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Server} from '../../providers/server';

@Page({
  templateUrl: 'build/pages/my-contests/my-contests.html',
  directives: [ContestListComponent]
})

export class MyContestsPage {

  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  server: Server;
  app:IonicApp;

  constructor(app:IonicApp) {
    this.app = app;
    this.server = Server.getInstance();
  }

  onPageDidEnter() {
    this.app.setTitle(this.server.translate('MY_CONTESTS'));
    this.contestList.refresh();
  }
}
