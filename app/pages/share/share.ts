import {Page,NavParams} from 'ionic/ionic';
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

}
