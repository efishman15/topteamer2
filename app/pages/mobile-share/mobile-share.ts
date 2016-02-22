import {Page,NavParams,ViewController} from 'ionic/ionic';
import {Client} from '../../providers/client';
import * as shareService from '../../providers/share';

@Page({
  templateUrl: 'build/pages/mobile-share/mobile-share.html'
})
export class MobileSharePage {

  client:Client;
  contest:Object;
  viewController:ViewController;

  constructor(params:NavParams, viewController: ViewController) {
    this.client = Client.getInstance();
    this.contest = params.data.contest;
    this.viewController = viewController;
  }

  dismiss(okPressed) {
    this.viewController.dismiss(okPressed).then(() => {
      if (okPressed) {
        shareService.share(this.contest);
      }
    });
  }
}
