import {Component,ViewChild} from '@angular/core';
import {Refresher} from 'ionic-angular'
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Client} from '../../providers/client';
import {Contest} from '../../objects/objects';
import * as analyticsService from '../../providers/analytics';

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

    this.client.events.subscribe('topTeamer:myContests:contestUpdated', (eventData) => {
      this.contestList.updateContest(eventData[0]);
    });

    this.client.events.subscribe('topTeamer:myContests:contestRemoved', (eventData) => {
      this.contestList.removeContest(eventData[0]);
    });

    this.client.events.subscribe('topTeamer:myContests:forceRefresh', () => {
      this.refreshList(true).then(()=> {
      }, ()=> {
      });
    });
  }

  ionViewWillEnter() {
    analyticsService.track('page/myContests');
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

  doRefresh(refresher:Refresher) {
    this.refreshList(true).then(() => {
      refresher.complete();
    }, () => {
      refresher.complete();
    })
  }

  showLeadingContests() {
    this.client.events.publish('topTeamer:showLeadingContests');
  }
}
