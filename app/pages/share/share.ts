import {Page,NavParams} from 'ionic/ionic';
import {Client} from '../../providers/client';
import * as shareService from '../../providers/share';
import {PlayerInfoComponent} from '../../components/player-info/player-info';

@Page({
  templateUrl: 'build/pages/share/share.html',
  directives: [PlayerInfoComponent]
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
