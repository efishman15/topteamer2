import {IonicApp, Page, Component} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Server} from '../../providers/server';

@Page({
  templateUrl: 'build/pages/recently-finished-contests/recently-finished-contests.html',
  directives: [ContestListComponent]
})

export class RecentlyFinishedContestsPage {

  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  server: Server;
  app:IonicApp;

  constructor(app:IonicApp) {
    this.app = app;
    this.server = Server.getInstance();
  }

  onPageDidEnter() {
    this.app.setTitle(this.server.translate('RECENTLY_FINISHED_CONTESTS'));
    this.contestList.refresh();
  }
}
