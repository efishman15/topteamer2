import {Component} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {Client} from '../../providers/client';
import * as shareService from '../../providers/share';
import {Contest,ShareVariables} from '../../objects/objects';

@Component({
  templateUrl: 'build/pages/share/share.html'
})

export class SharePage {

  client:Client;
  contest:Contest;
  shareVariables:ShareVariables;

  constructor(params:NavParams) {
    this.client = Client.getInstance();
    if (params && params.data) {
      this.contest = params.data.contest;
    }

    this.shareVariables = shareService.getVariables(this.contest);
  }

  ionViewWillEnter() {
    if (this.contest) {
      this.client.logEvent('page/share', {'contestId': this.contest._id});
    }
    else {
      this.client.logEvent('page/share');
    }
  }

  share(network) {
    window.open(network.url.format({url: this.shareVariables.shareUrl, subject: this.shareVariables.shareSubject, emailBody: this.shareVariables.shareBodyEmail}),'_blank');
    this.client.logEvent('share/web/' + network.name);
  }
}
