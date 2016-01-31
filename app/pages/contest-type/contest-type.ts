import {Page, Component,ViewController} from 'ionic/ionic';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/contest-type/contest-type.html'
})
export class ContestTypePage {

  client:Client;
  viewController: ViewController;

  constructor(viewController: ViewController) {
    this.client = Client.getInstance();
    this.viewController = viewController;
  }

  selectContestContent(content) {
    this.viewController.dismiss(content);
  }

}
