import {Page,NavParams,ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';
import * as shareService from '../../providers/share';
import {Contest} from '../../objects/objects';

@Page({
  templateUrl: 'build/pages/mobile-share/mobile-share.html'
})
export class MobileSharePage {

  client:Client;
  contest:Contest;
  viewController:ViewController;

  constructor(params:NavParams, viewController: ViewController) {
    this.client = Client.getInstance();
    this.contest = params.data.contest;
    this.viewController = viewController;
  }

  //The only life cycle eve currently called in modals
  ngAfterViewInit() {
    this.client.logEvent('page/mobileShare', {'contestId' : this.contest._id});
  }

  dismiss(okPressed) {

    this.client.logEvent('contest/popup/share/' + okPressed);

    this.viewController.dismiss(okPressed).then(() => {
      if (okPressed) {
        shareService.share('mobilePopup', this.contest);
      }
    });
  }
}
