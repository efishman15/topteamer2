import {Component,ViewChild} from '@angular/core';
import {Tabs, ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';
import {Contest} from "../../objects/objects";

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

    this.client.events.subscribe('topTeamer:languageChanged', () => {
      window.location.reload();
    });

    this.client.events.subscribe('topTeamer:serverPopup', (eventData) => {
      this.client.showModalPage('ServerPopupPage', {'serverPopup': eventData[0]});
    });

    this.client.events.subscribe('topTeamer:noPersonalContests', () => {
      this.mainTabs.select(1); //Switch to "Running contests"
    });

  }

  ionViewDidEnter() {
    //Should occur only once - and AFTER top toolbar received it's height
    if (!this.playerInfoInitiated) {
      this.client.initPlayerInfo();
      this.client.initXp();
      this.playerInfoInitiated = true;
    }

    //Events here could be serverPopup just as the app loads - the page should be fully visible
    this.client.processInternalEvents();

    //Came from external deep linking
    if (this.client.deepLinkContestId) {
      var contestId = this.client.deepLinkContestId;
      this.client.deepLinkContestId = null;
      this.client.displayContest(contestId);
    }
  }

  onResize() {
    var selectedPage = this.mainTabs.getSelected().first();
    if (selectedPage.instance && selectedPage.instance.onResize) {
      selectedPage.instance.onResize();
    }
  }

  getTabPage(index:number) {
    let viewController: ViewController = this.mainTabs.getByIndex(index).first();
    return viewController.instance;
  }

  handleContestCreated() {
    //Force refresh my contests
    this.getTabPage(0).refreshList(true).then(()=> {
    }, ()=> {
    });
  }

  handleContestUpdated(contest:Contest, previousStatus:string, currentStatus:string) {
    if (previousStatus === currentStatus) {
      //Was finished and remained finished, or was running and still running...
      switch (currentStatus) {
        case 'starting':
          //For admins - future contests - appear only in "my Contests"
          this.getTabPage(0).contestList.updateContest(contest);
          break;
        case 'running':
          //Appears in my contests / running contests
          this.getTabPage(0).contestList.updateContest(contest);
          this.getTabPage(1).contestList.updateContest(contest);
          break;
        case 'finished':
          //Appears in recently finished contests
          this.getTabPage(2).contestList.updateContest(contest);
          break;
      }
    }
    else {
      switch (previousStatus) {
        case 'starting':
          if (currentStatus === 'running') {

            //Update my contests
            this.getTabPage(0).contestList.updateContest(contest);

            //Refresh running contests - might appear there
            this.getTabPage(1).refreshList(true).then(()=> {
            }, () => {
            });
          }
          else {
            //finished

            //Remove from my contests
            this.getTabPage(0).contestList.removeContest(contest._id);

            //Refresh recently finished contests
            this.getTabPage(2).refreshList(true).then(() => {
            }, () => {
            });
          }
          break;
        case 'running':
          if (currentStatus === 'starting') {

            //Update my contests
            this.getTabPage(0).contestList.updateContest(contest);

            //Remove from running contests
            this.getTabPage(1).contestList.removeContest(contest._id);
          }
          else {
            //finished

            //Remove from my contests and from running contests
            this.getTabPage(0).contestList.removeContest(contest._id);
            this.getTabPage(1).contestList.removeContest(contest._id);

            //Refresh recently finished contests
            this.getTabPage(2).refreshList(true).then(()=> {
            }, ()=> {
            });
          }
          break;
        case 'finished':
          //Remove from finished contests
          this.getTabPage(2).contestList.removeContest(contest._id);

          if (currentStatus === 'starting') {

            //Refresh my contests
            this.getTabPage(0).refreshList(true).then(()=> {
            }, ()=> {
            });
          }
          else {
            //running

            //Refresh my contests
            this.getTabPage(0).refreshList(true).then(()=> {
            }, () => {
            });

            //Refresh running contests
            this.getTabPage(1).refreshList(true).then(()=> {
            }, () => {
            });

          }
          break;
      }
    }

  }

  handleContestRemoved(contestId:string, finishedContest:boolean) {
    if (!finishedContest) {
      //Try to remove it from 'my contests' and 'running contests' tabs
      this.getTabPage(0).contestList.removeContest(contestId);
      this.getTabPage(1).contestList.removeContest(contestId);
    }
    else {
      //Try to remove it from the recently finished tab
      this.getTabPage(2).contestList.removeContest(contestId);
    }
  }
}
