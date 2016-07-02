import {Component,ViewChild} from '@angular/core';
import {Refresher} from 'ionic-angular'
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Client} from '../../providers/client';

@Component({
  templateUrl: 'build/pages/running-contests/running-contests.html',
  directives: [ContestListComponent]
})

export class RunningContestsPage {

  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  client: Client;

  constructor() {
    this.client = Client.getInstance();
  }

  ionViewWillEnter() {
    this.client.logEvent('page/runningContests');
    this.refreshList().then (() => {
    }, () => {
    });
  }

  refreshList(forceRefresh? : boolean) {
    return this.contestList.refresh(forceRefresh);
  }

  onResize() {
    this.contestList.onResize();
  }

  doRefresh(refresher: Refresher) {
    this.refreshList(true).then(() => {
      refresher.complete();
    }, () => {
      refresher.complete();
    })
  }
}
