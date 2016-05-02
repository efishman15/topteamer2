import {Page, Tabs,Modal} from 'ionic-angular';
import {ViewChild} from 'angular2/core';
import {MyContestsPage} from '../my-contests/my-contests';
import {RunningContestsPage} from '../running-contests/running-contests';
import {LeaderboardsPage} from '../leaderboards/leaderboards';
import {Client} from '../../providers/client';
import {ServerPopupPage} from '../server-popup/server-popup';

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

    this.client.events.subscribe('topTeamer:languageChanged', (eventData) => {
      this.needToRefreshList = true;
    });

    this.client.events.subscribe('topTeamer:serverPopup', (eventData) => {
      var modal = Modal.create(ServerPopupPage, {'serverPopup': eventData[0]});
      this.client.nav.present(modal);
    });

    this.client.events.subscribe('topTeamer:noPersonalContests', (eventData) => {
      this.mainTabs.select(1); //Switch to "Running contests"
    });

  }

  ngAfterViewInit() {
    this.client.initXp();
  }

  onPageWillEnter() {
    if (this.needToRefreshList) {
      var selectedPage = this.mainTabs.getSelected().getActive();
      if (selectedPage.instance.willEnter) {
        selectedPage.instance.willEnter();
      }
      this.needToRefreshList = false;
    }
  }

  onPageDidEnter() {
    //Events here could be serverPopup just as the app loads - the page should be fully visible
    this.client.processInternalEvents();
  }

  onResize() {
    var selectedPage = this.mainTabs.getSelected().getActive();
    if (selectedPage.instance && selectedPage.instance.onResize) {
      selectedPage.instance.onResize();
    }
  }
}
