import {Page, Tabs} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {MyContestsPage} from '../my-contests/my-contests';
import {RunningContestsPage} from '../running-contests/running-contests';
import {LeaderboardsPage} from '../leaderboards/leaderboards';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/main-tabs/main-tabs.html'
})
export class MainTabsPage {

  client: Client;
  @ViewChild(Tabs) mainTabs:Tabs;
  needToRefreshList:Boolean;

  private rootMyContestsPage;
  private rootRunningContestsPage;
  private rootLeaderboardsPage;

  constructor() {
    // set the root pages for each tab
    this.rootMyContestsPage = MyContestsPage;
    this.rootRunningContestsPage = RunningContestsPage;
    this.rootLeaderboardsPage = LeaderboardsPage;

    this.client = Client.getInstance();

    this.client.events.subscribe('topTeamer:contestCreated', (eventData) => {
      this.needToRefreshList = true;
    });

    this.client.events.subscribe('topTeamer:contestRemoved', () => {
      this.needToRefreshList = true;
    });

    this.client.events.subscribe('topTeamer:contestUpdated', (eventData) => {
      this.needToRefreshList = true;
    });
  }

  onPageWillEnter() {
    if (this.needToRefreshList) {
      var selectedPage = this.mainTabs.getSelected().getActive();
      if (selectedPage.willEnter) {
        selectedPage.willEnter();
      }
      this.needToRefreshList = false;
    }
  }
}
