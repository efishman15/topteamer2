import {Component,ViewChild} from '@angular/core';
import {Refresher} from 'ionic-angular'
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Client} from '../../providers/client';
import * as analyticsService from '../../providers/analytics';

@Component({
  templateUrl: 'build/pages/running-contests/running-contests.html',
  directives: [ContestListComponent]
})

export class RunningContestsPage {

  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  client: Client;

  constructor() {
    this.client = Client.getInstance();

    this.client.events.subscribe('topTeamer:runningContests:contestUpdated', (eventData) => {
      this.contestList.updateContest(eventData[0]);
    });

    this.client.events.subscribe('topTeamer:runningContests:contestRemoved', (eventData) => {
      this.contestList.removeContest(eventData[0]);
    });

    this.client.events.subscribe('topTeamer:runningContests:forceRefresh', () => {
      this.refreshList(true).then(()=> {
      }, ()=> {
      });
    });
  }

  ionViewWillEnter() {
    analyticsService.track('page/runningContests');
    this.refreshList().then (() => {
    }, () => {
    });
  }

  refreshList(forceRefresh? : boolean) {
    return this.contestList.refresh(forceRefresh);
  }

  doRefresh(refresher: Refresher) {
    this.refreshList(true).then(() => {
      refresher.complete();
    }, () => {
      refresher.complete();
    })
  }
}
