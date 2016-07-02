import {Component,ViewChild} from '@angular/core';
import {Refresher} from 'ionic-angular'
import {SimpleTabsComponent} from '../../components/simple-tabs/simple-tabs';
import {SimpleTabComponent} from '../../components/simple-tab/simple-tab';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {LeadersComponent} from '../../components/leaders/leaders';
import {Client} from '../../providers/client';

@Component({
  templateUrl: 'build/pages/leaderboards/leaderboards.html',
  directives: [SimpleTabsComponent, SimpleTabComponent, ContestListComponent, LeadersComponent]
})

export class LeaderboardsPage {

  client:Client;
  mode:string;
  @ViewChild(SimpleTabsComponent) simpleTabsComponent:SimpleTabsComponent;
  @ViewChild(ContestListComponent) contestList:ContestListComponent;
  @ViewChild(LeadersComponent) leadersComponent:LeadersComponent;

  constructor() {
    this.client = Client.getInstance();
  }

  ionViewWillEnter() {
    this.simpleTabsComponent.switchToTab(0);
  }

  displayRecentlyFinishedContestsTab() {
    this.client.logEvent('page/leaderboard/contests');
    this.mode = 'contests';
    this.showRecentlyFinishedContests(false).then(()=> {
    },()=> {
    })
  }

  showRecentlyFinishedContests(forceRefresh? : boolean) {
    this.client.logEvent('page/leaderboard/contests');
    this.mode = 'contests';
    return this.contestList.refresh(forceRefresh);
  }

  displayFriendsLeaderboardTab() {
    this.client.logEvent('page/leaderboard/friends');
    this.mode = 'friends';
    this.showFriendsLeaderboard(false).then(()=> {
    }, ()=> {
    })
  }

  showFriendsLeaderboard(forceRefresh?:boolean) {
    this.client.logEvent('page/leaderboard/friends');
    this.mode = 'friends';
    return this.leadersComponent.showFriends(false, forceRefresh);
  }

  displayWeeklyLeaderboardTab() {
    this.client.logEvent('page/leaderboard/weekly');
    this.mode = 'weekly';
    this.showWeeklyLeaderboard(false).then(() => {
    }, ()=> {
    });
  }

  showWeeklyLeaderboard(forceRefresh?:boolean) {
    this.client.logEvent('page/leaderboard/weekly');
    this.mode = 'weekly';
    return this.leadersComponent.showWeekly(forceRefresh);
  }

  onResize() {
    if (this.mode === 'contests') {
      this.contestList.onResize();
    }
  }

  refreshList(forceRefresh?:boolean) {
    return this.contestList.refresh(forceRefresh);
  }

  doRefresh(refresher:Refresher) {
    switch (this.mode) {
      case 'contests':
        this.contestList.refresh(true).then(() => {
          refresher.complete();
        }, () => {
          refresher.complete();
        })
        break;
      case 'friends':
        this.showFriendsLeaderboard(true).then(() => {
          refresher.complete();
        }, () => {
          refresher.complete();
        })
        break;
      case 'weekly':
        this.showWeeklyLeaderboard(true).then(() => {
          refresher.complete();
        }, () => {
          refresher.complete();
        })
        break;
    }
  }
}
