import {Component} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {Client} from '../../providers/client';
import * as shareService from '../../providers/share';
import {Contest,ShareVariables,ShareWebNetwork} from '../../objects/objects';

@Component({
  templateUrl: 'build/pages/share/share.html'
})

export class SharePage {

  client:Client;
  params: NavParams;
  shareVariables:ShareVariables;

  constructor(params:NavParams) {
    this.client = Client.getInstance();
    this.params = params;
    this.shareVariables = shareService.getVariables(this.params.data.contest);
  }

  ionViewWillEnter() {
    if (this.params.data.contest) {
      this.client.logEvent('page/share', {'contestId': this.params.data.contest._id, 'source': this.params.data.source});
    }
    else {
      this.client.logEvent('page/share', {'source': this.params.data.source});
    }
  }

  webShare(network: any) {
    window.open(network.url.format({url: this.shareVariables.shareUrl, subject: this.shareVariables.shareSubject, emailBody: this.shareVariables.shareBodyEmail}),'_blank');
    this.client.logEvent('share/web/' + network.name);
  }

  mobileShare(appName?: string) {
    shareService.mobileShare(appName, this.params.data.contest);
  }
}
