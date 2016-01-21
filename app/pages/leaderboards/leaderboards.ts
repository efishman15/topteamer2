import {Page} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {SimpleTabsComponent} from '../../components/simple-tabs/simple-tabs';
import {SimpleTabComponent} from '../../components/simple-tab/simple-tab';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {LeadersComponent} from '../../components/leaders/leaders';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';

@Page({
  templateUrl: 'build/pages/leaderboards/leaderboards.html',
  directives: [SimpleTabsComponent, SimpleTabComponent,ContestListComponent,LeadersComponent]
})

export class LeaderboardsPage {

  client: Client;
  mode: String = 'contests';
  @ViewChild(SimpleTabsComponent) simpleTabsComponent : SimpleTabsComponent;
  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  @ViewChild(LeadersComponent) leadersComponent : LeadersComponent;

  constructor() {
    this.client = Client.getInstance();
  }

  onPageDidEnter() {
    this.simpleTabsComponent.switchToTab(0);
  }

  showRecentlyFinishedContests() {
    this.mode = 'contests';
    this.contestList.refresh();
    console.log("showRecentlyFinishedContests");
  }

  showFriendsLeaderboard() {
    //TODO: friendsPermissionJustGranted
    this.mode = 'leaders';
    this.leadersComponent.showFriends()
  }

  showWeeklyLeaderboard() {
    this.mode = 'leaders';
    this.leadersComponent.showWeekly();
  }

  onContestSelected(data) {
    contestsService.openContest(data.contest._id);
  }

}