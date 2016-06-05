import {ViewChild} from '@angular/core';
import {Page, Tabs} from 'ionic-angular';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/main-tabs/main-tabs.html'
})
export class MainTabsPage {

  client: Client;
  @ViewChild(Tabs) mainTabs:Tabs;
  needToRefreshList:boolean;
  playerInfoInitiated: boolean

  private rootMyContestsPage;
  private rootRunningContestsPage;
  private rootLeaderboardsPage;

  constructor() {

    this.client = Client.getInstance();

    // set the root pages for each tab
    this.rootMyContestsPage = this.client.getPage('MyContestsPage');
    this.rootRunningContestsPage = this.client.getPage('RunningContestsPage');
    this.rootLeaderboardsPage = this.client.getPage('LeaderboardsPage');


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
      this.client.showModalPage('ServerPopupPage', {'serverPopup': eventData[0]});
    });

    this.client.events.subscribe('topTeamer:noPersonalContests', (eventData) => {
      this.mainTabs.select(1); //Switch to "Running contests"
    });

  }

  onPageWillEnter() {
    if (this.needToRefreshList) {
      var selectedPage = this.mainTabs.getSelected().getActive();
      if (selectedPage.instance.onPageWillEnter) {
        selectedPage.instance.onPageWillEnter();
      }
      this.needToRefreshList = false;
    }
  }

  onPageDidEnter() {
    //Should occur only once - and AFTER top toolbar received it's height
    if (!this.playerInfoInitiated) {
      this.client.initPlayerInfo();
      this.client.initXp();
      this.playerInfoInitiated = true;
    }

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
