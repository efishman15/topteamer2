import {Page, Component,ViewController} from 'ionic/ionic';
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

  selectContestContent(contestType) {
    this.client.logEvent('newContest/type/' + (contestType ? contestType.id : 'cancel'));
    this.viewController.dismiss(contestType);
  }

}
