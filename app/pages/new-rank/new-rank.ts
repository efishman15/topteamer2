import {Page,NavParams,ViewController} from 'ionic/ionic';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/new-rank/new-rank.html'
})
export class NewRankPage {

  client:Client;
  xpProgress:Object;
  viewController:ViewController;

  constructor(params:NavParams, viewController: ViewController) {
    this.client = Client.getInstance();
    this.xpProgress = params.data.xpProgress;
    this.viewController = viewController;
  }

  dismiss(okPressed) {
    this.viewController.dismiss(okPressed);
  }
}
