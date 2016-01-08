import {Page} from 'ionic/ionic';
import {MyContestsPage} from '../my-contests/my-contests';
import {RunningContestsPage} from '../running-contests/running-contests';
import {RecentlyFinishedContestsPage} from '../recently-finished-contests/recently-finished-contests';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {

  client: Client;

  private rootMyContestsPage;
  private rootRunningContestsPage;
  private rootRecentlyFinishedContestsPage;

  constructor() {
    // set the root pages for each tab
    this.rootMyContestsPage = MyContestsPage;
    this.rootRunningContestsPage = RunningContestsPage;
    this.rootRecentlyFinishedContestsPage = RecentlyFinishedContestsPage;

    this.client = Client.getInstance();
  }
}
