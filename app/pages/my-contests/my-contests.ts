import {Component,ViewChild} from '@angular/core';
import {Refresher} from 'ionic-angular'
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Client} from '../../providers/client';
import {Contest} from '../../objects/objects';

@Component({
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

  ionViewWillEnter() {
    this.client.logEvent('page/myContests');
    this.refreshList().then(() => {
      if (this.contestList.contests.length === 0 && !this.pageLoaded) {
        //On load only - switch to "running contests" if no personal contests
        this.client.events.publish('topTeamer:noPersonalContests');
      }
      this.pageLoaded = true;
    }, () => {

    });
  }

  refreshList(forceRefresh?:boolean) {
    return this.contestList.refresh(forceRefresh);
  }

  onResize() {
    this.contestList.onResize();
  }

  doRefresh(refresher:Refresher) {
    this.refreshList(true).then(() => {
      refresher.complete();
    }, () => {
      refresher.complete();
    })
  }
}
