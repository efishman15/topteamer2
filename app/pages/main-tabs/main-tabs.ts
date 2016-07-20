import {Component,ViewChild} from '@angular/core';
import {Tabs, Tab, ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';
import {Contest} from "../../objects/objects";

const ACTION_UPDATE_CONTEST:string = 'contestUpdated';
const ACTION_REMOVE_CONTEST:string = 'contestRemoved';
const ACTION_FORCE_REFRESH:string = 'forceRefresh';

@Component({
  templateUrl: 'build/pages/main-tabs/main-tabs.html'
})
export class MainTabsPage {

  client:Client;
  @ViewChild(Tabs) mainTabs:Tabs;
  playerInfoInitiated:boolean;

  private rootMyContestsPage;
  private rootRunningContestsPage;
  private rootLeaderboardsPage;

  constructor() {

    this.client = Client.getInstance();

    // set the root pages for each tab
    this.rootMyContestsPage = this.client.getPage('MyContestsPage');
    this.rootRunningContestsPage = this.client.getPage('RunningContestsPage');
    this.rootLeaderboardsPage = this.client.getPage('LeaderboardsPage');

    this.client.events.subscribe('topTeamer:contestCreated', () => {
      this.handleContestCreated();
    });

    this.client.events.subscribe('topTeamer:contestUpdated', (eventData) => {
      this.handleContestUpdated(eventData[0], eventData[1], eventData[2])
    });

    this.client.events.subscribe('topTeamer:contestRemoved', (eventData) => {
      this.handleContestRemoved(eventData[0], eventData[1])
    });

    this.client.events.subscribe('topTeamer:languageChanged', (eventData) => {
      if (eventData[0]) {
        window.location.reload();
      }
      else {
        //Just refresh the contests to reflect the new language
        this.publishActionToTab(0,ACTION_FORCE_REFRESH);
        this.publishActionToTab(1,ACTION_FORCE_REFRESH);
        this.publishActionToTab(2,ACTION_FORCE_REFRESH);
      }
    });

    this.client.events.subscribe('topTeamer:serverPopup', (eventData) => {
      this.client.showModalPage('ServerPopupPage', {'serverPopup': eventData[0]});
    });

    this.client.events.subscribe('topTeamer:noPersonalContests', () => {
      this.mainTabs.select(1); //Switch to "Running contests"
    });

    this.client.events.subscribe('topTeamer:showLeadingContests', () => {
      this.mainTabs.select(1); //Switch to "Running contests"
    });

  }

  ionViewDidEnter() {
    //Should occur only once - and AFTER top toolbar received it's height
    if (!this.playerInfoInitiated) {
      this.client.initPlayerInfo();
      this.client.initXp();
      this.playerInfoInitiated = true;
      this.client.hidePreloader();
    }

    //Events here could be serverPopup just as the app loads - the page should be fully visible
    this.client.processInternalEvents();

    //Came from external deep linking
    if (this.client.deepLinkContestId) {
      var contestId = this.client.deepLinkContestId;
      this.client.deepLinkContestId = null;
      this.client.displayContestById(contestId).then(() => {
      }, () => {
      });
    }
  }

  onResize() {
    var selectedPage = this.mainTabs.getSelected().first();
    if (selectedPage.instance && selectedPage.instance.onResize) {
      selectedPage.instance.onResize();
    }
  }

  publishActionToTab(index:number, action: string, param?: any) {

    let eventName: string = 'topTeamer:';
    switch (index) {
      case 0:
            eventName += 'myContests';
            break;
      case 1:
        eventName += 'runningContests';
        break;
      case 2:
        eventName += 'recentlyFinishedContests';
        break;
    }

    eventName += ':' + action;

    if (param) {
      this.client.events.publish(eventName, param);
    }
    else {
      this.client.events.publish(eventName);
    }
  }

  handleContestCreated() {
    //Force refresh my contests
    this.publishActionToTab(0,ACTION_FORCE_REFRESH);
  }

  handleContestUpdated(contest:Contest, previousStatus:string, currentStatus:string) {
    if (previousStatus === currentStatus) {
      //Was finished and remained finished, or was running and still running...
      switch (currentStatus) {
        case 'starting':
          //For admins - future contests - appear only in "my Contests"
          this.publishActionToTab(0,ACTION_UPDATE_CONTEST,contest);
          break;
        case 'running':
          //Appears in my contests / running contests
          this.publishActionToTab(0,ACTION_UPDATE_CONTEST,contest);
          this.publishActionToTab(1,ACTION_UPDATE_CONTEST,contest);
          break;
        case 'finished':
          //Appears in recently finished contests
          this.publishActionToTab(2,ACTION_UPDATE_CONTEST,contest);
          break;
      }
    }
    else {
      switch (previousStatus) {
        case 'starting':
          if (currentStatus === 'running') {

            //Update my contests
            this.publishActionToTab(0,ACTION_UPDATE_CONTEST,contest);

            //Refresh running contests - might appear there
            this.publishActionToTab(1,ACTION_FORCE_REFRESH);
          }
          else {
            //finished

            //Remove from my contests
            this.publishActionToTab(0,ACTION_REMOVE_CONTEST,contest._id);

            //Refresh recently finished contests
            this.publishActionToTab(2,ACTION_FORCE_REFRESH);
          }
          break;
        case 'running':
          if (currentStatus === 'starting') {

            //Update my contests
            this.publishActionToTab(0,ACTION_UPDATE_CONTEST,contest);

            //Remove from running contests
            this.publishActionToTab(1,ACTION_REMOVE_CONTEST,contest._id);
          }
          else {
            //finished

            //Remove from my contests and from running contests
            this.publishActionToTab(0,ACTION_REMOVE_CONTEST,contest._id);
            this.publishActionToTab(1,ACTION_REMOVE_CONTEST,contest._id);

            //Refresh recently finished contests
            this.publishActionToTab(2,ACTION_FORCE_REFRESH);
          }
          break;
        case 'finished':
          //Remove from finished contests
          this.publishActionToTab(2,ACTION_REMOVE_CONTEST,contest._id);

          if (currentStatus === 'starting') {

            //Refresh my contests
            this.publishActionToTab(0,ACTION_FORCE_REFRESH);
          }
          else {
            //running

            //Refresh my contests
            this.publishActionToTab(0,ACTION_FORCE_REFRESH);

            //Refresh running contests
            this.publishActionToTab(1,ACTION_FORCE_REFRESH);

          }
          break;
      }
    }

  }

  handleContestRemoved(contestId:string, finishedContest:boolean) {
    if (!finishedContest) {
      //Try to remove it from 'my contests' and 'running contests' tabs
      this.publishActionToTab(0,ACTION_REMOVE_CONTEST, contestId);
      this.publishActionToTab(1,ACTION_REMOVE_CONTEST, contestId);
    }
    else {
      //Try to remove it from the recently finished tab
      this.publishActionToTab(2,ACTION_REMOVE_CONTEST, contestId);
    }
  }
}
