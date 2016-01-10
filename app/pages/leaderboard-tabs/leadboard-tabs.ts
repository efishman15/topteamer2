import {Page} from 'ionic/ionic';
import {RecentlyFinishedContestsPage} from '../recently-finished-contests/recently-finished-contests';
import {FriendsLeaderboardPage} from '../friends-leaderboard/friends-leaderboard';
import {WeeklyLeaderboardPage} from '../weekly-leaderboard/weekly-leaderboard';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/leaderboard-tabs/leaderboard-tabs.html'
})
export class LeaderboardTabsPage {

  client: Client;

  private rootRecentlyFinishedContestsPage;
  private rootFriendsLeaderboardPage;
  private rootWeeklyLeaderboardPage;

  constructor() {
    // set the root pages for each tab
    this.rootRecentlyFinishedContestsPage = RecentlyFinishedContestsPage;
    this.rootFriendsLeaderboardPage = FriendsLeaderboardPage;
    this.rootWeeklyLeaderboardPage = WeeklyLeaderboardPage;

    this.client = Client.getInstance();

    this.client.setPageTitle('LEADERBOARDS');

  }
}
