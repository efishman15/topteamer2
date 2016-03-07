import {Page,NavParams} from 'ionic-angular';
import {Client} from '../../providers/client';
import * as shareService from '../../providers/share';

@Page({
  templateUrl: 'build/pages/share/share.html'
})

export class SharePage {

  client:Client;
  contest:Object;
  shareVariables:Object;

  constructor(params:NavParams) {
    this.client = Client.getInstance();
    if (params && params.data) {
      this.contest = params.data.contest;
    }

    this.shareVariables = shareService.getVariables(this.contest);
  }

  onPageWillEnter() {
    if (this.contest) {
      this.client.logEvent('page/share', {'contestId': this.contest._id});
    }
    else {
      this.client.logEvent('page/share');
    }
  }

  share(network) {
    console.log('network='+ network.name + ', url=' + network.url);
    window.open(network.url.format({url: this.shareVariables.shareUrl, subject: this.shareVariables.shareSubject, emailBody: this.shareVariables.shareBodyEmail}),'_blank');
    this.client.logEvent('share/web/' + network.name);
  }
}
