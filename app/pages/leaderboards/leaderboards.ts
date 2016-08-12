import {Component,ViewChild} from '@angular/core';
import {Refresher} from 'ionic-angular'
import {SimpleTabsComponent} from '../../components/simple-tabs/simple-tabs';
import {SimpleTabComponent} from '../../components/simple-tab/simple-tab';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {LeadersComponent} from '../../components/leaders/leaders';
import {Client} from '../../providers/client';
import * as analyticsService from '../../providers/analytics';
import * as connectService from '../../providers/connect';
import {ConnectInfo} from "../../objects/objects";

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

    this.client.events.subscribe('topTeamer:recentlyFinishedContests:contestUpdated', (eventData) => {
      this.contestList.updateContest(eventData[0]);
    });

    this.client.events.subscribe('topTeamer:recentlyFinishedContests:contestRemoved', (eventData) => {
      this.contestList.removeContest(eventData[0]);
    });

    this.client.events.subscribe('topTeamer:recentlyFinishedContests:forceRefresh', () => {
      this.refreshList(true).then(()=> {
      }, ()=> {
      });
    });

    this.client.events.subscribe('topTeamer:leaderboardsUpdated', () => {
      switch (this.mode) {
        case 'contests':
          this.contestList.refresh(true).then(() => {
          }, () => {
          })
          break;
        case 'friends':
          this.showFriendsLeaderboard(true).then(() => {
          }, () => {
          })
          break;
        case 'weekly':
          this.showWeeklyLeaderboard(true).then(() => {
          }, () => {
          })
          break;
      }
    });
  }

  ionViewWillEnter() {
    this.simpleTabsComponent.switchToTab(0);
  }

  displayRecentlyFinishedContestsTab() {
    analyticsService.track('page/leaderboard/contests');
    this.mode = 'contests';
    this.showRecentlyFinishedContests(false).then(()=> {
    }, ()=> {
    })
  }

  showRecentlyFinishedContests(forceRefresh?:boolean) {
    analyticsService.track('page/leaderboard/contests');
    this.mode = 'contests';
    return this.contestList.refresh(forceRefresh);
  }

  displayFriendsLeaderboardTab() {
    analyticsService.track('page/leaderboard/friends');
    this.mode = 'friends';
    this.showFriendsLeaderboard(false).then(()=> {
    }, ()=> {
    })
  }

  showFriendsLeaderboard(forceRefresh?:boolean) {
    analyticsService.track('page/leaderboard/friends');
    this.mode = 'friends';
    return this.leadersComponent.showFriends(forceRefresh);
  }

  displayWeeklyLeaderboardTab() {
    analyticsService.track('page/leaderboard/weekly');
    this.mode = 'weekly';
    this.showWeeklyLeaderboard(false).then(() => {
    }, ()=> {
    });
  }

  showWeeklyLeaderboard(forceRefresh?:boolean) {
    analyticsService.track('page/leaderboard/weekly');
    this.mode = 'weekly';
    return this.leadersComponent.showWeekly(forceRefresh);
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

  facebookLogin() {
    connectService.facebookLogin().then((connectInfo:ConnectInfo)=> {
      this.client.upgradeGuest(connectInfo).then(()=> {
        connectService.storeCredentials(connectInfo);
        //I am located at the friends tab - refresh since I just upgraded to facebook
        //Should immediatelly see my friends
        this.showFriendsLeaderboard(true).then(()=>{
        },()=>{
        })
      }, ()=> {
      })
    }, ()=> {
    });
  }

}
