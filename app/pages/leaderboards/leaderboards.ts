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

  nextTimeForceRefreshContests:boolean;
  nextTimeForceRefreshFriends:boolean;
  nextTimeForceRefreshWeekly:boolean;

  private contestUpdatedHandler : (eventData:any) => void;
  private contestRemovedHandler : (eventData:any) => void;
  private forceRefreshHandler : () => void;
  private switchedToFacebookHandler : () => void;
  private leaderboardsUpdatedHandler : () => void;

  constructor() {
    this.client = Client.getInstance();
  }

  ionViewLoaded() {
    this.contestUpdatedHandler = (eventData:any) => {
      this.contestList.updateContest(eventData[0]);
    }
    this.contestRemovedHandler = (eventData:any) => {
      this.contestList.removeContest(eventData[0]);
    }
    this.forceRefreshHandler = () => {
      this.refreshList(true).then(()=>{
      },()=>{
      });
    }
    this.switchedToFacebookHandler = () => {
      switch (this.mode) {
        case 'contests':
          this.nextTimeForceRefreshFriends = true;
          this.nextTimeForceRefreshWeekly = true;
          this.contestList.refresh(true).then(() => {
          }, () => {
          })
          break;
        case 'friends':
          this.nextTimeForceRefreshContests = true;
          this.nextTimeForceRefreshWeekly = true;
          this.showFriendsLeaderboard(true).then(() => {
          }, () => {
          })
          break;
        case 'weekly':
          this.nextTimeForceRefreshContests = true;
          this.nextTimeForceRefreshFriends = true;
          this.showWeeklyLeaderboard(true).then(() => {
          }, () => {
          })
          break;
      }
    }
    this.leaderboardsUpdatedHandler = () => {
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
    }

    this.client.events.subscribe('app:recentlyFinishedContests:contestUpdated', this.contestUpdatedHandler);
    this.client.events.subscribe('app:recentlyFinishedContests:contestRemoved', this.contestRemovedHandler);
    this.client.events.subscribe('app:recentlyFinishedContests:forceRefresh', this.forceRefreshHandler);
    this.client.events.subscribe('app:switchedToFacebook', this.switchedToFacebookHandler);
    this.client.events.subscribe('app:leaderboardsUpdated', this.leaderboardsUpdatedHandler);
  }

  ionViewWillUnload() {
    this.client.events.unsubscribe('app:recentlyFinishedContests:contestUpdated', this.contestUpdatedHandler);
    this.client.events.unsubscribe('app:recentlyFinishedContests:contestRemoved', this.contestRemovedHandler);
    this.client.events.unsubscribe('app:recentlyFinishedContests:forceRefresh', this.forceRefreshHandler);
    this.client.events.unsubscribe('app:switchedToFacebook', this.switchedToFacebookHandler);
    this.client.events.unsubscribe('app:leaderboardsUpdated', this.leaderboardsUpdatedHandler);
  }

  ionViewWillEnter() {
    this.simpleTabsComponent.switchToTab(0);
  }

  displayRecentlyFinishedContestsTab() {
    analyticsService.track('page/leaderboard/contests');
    this.mode = 'contests';
    let forceRefresh:boolean = false;
    if (this.nextTimeForceRefreshContests) {
      this.nextTimeForceRefreshContests = false;
      forceRefresh = true;
    }
    this.showRecentlyFinishedContests(forceRefresh).then(()=> {
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
    let forceRefresh:boolean = false;
    if (this.nextTimeForceRefreshFriends) {
      this.nextTimeForceRefreshFriends = false;
      forceRefresh = true;
    }
    this.showFriendsLeaderboard(forceRefresh).then(()=> {
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
    let forceRefresh:boolean = false;
    if (this.nextTimeForceRefreshWeekly) {
      this.nextTimeForceRefreshWeekly = false;
      forceRefresh = true;
    }
    this.showWeeklyLeaderboard(forceRefresh).then(() => {
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
