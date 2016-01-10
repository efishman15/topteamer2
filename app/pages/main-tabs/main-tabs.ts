import {Page} from 'ionic/ionic';
import {MyContestsPage} from '../my-contests/my-contests';
import {RunningContestsPage} from '../running-contests/running-contests';
import {LeaderboardTabsPage} from '../leaderboard-tabs/leadboard-tabs';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/main-tabs/main-tabs.html'
})
export class MainTabsPage {

  client: Client;

  private rootMyContestsPage;
  private rootRunningContestsPage;
  private rootLeaderboardTabs;

  constructor() {
    // set the root pages for each tab
    this.rootMyContestsPage = MyContestsPage;
    this.rootRunningContestsPage = RunningContestsPage;
    this.rootLeaderboardTabs = LeaderboardTabsPage;

    this.client = Client.getInstance();
  }
}
