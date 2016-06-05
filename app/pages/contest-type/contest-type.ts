import {Page, ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/contest-type/contest-type.html'
})
export class ContestTypePage {

  client:Client;
  viewController: ViewController;

  onPageWillEnter() {
    this.client.logEvent('page/contestType');
  }

  constructor(viewController: ViewController) {
    this.client = Client.getInstance();
    this.viewController = viewController;
  }

  selectContestContent(contestTypeId) {
    this.client.logEvent('newContest/type/' + (contestTypeId ? contestTypeId : 'cancel'));
    this.viewController.dismiss(contestTypeId);
  }

}
