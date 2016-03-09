import {Page,NavParams} from 'ionic-angular';
import {Client} from '../../providers/client';
import {Contest} from '../../objects/objects';

@Page({
  templateUrl: 'build/pages/like/like.html'
})
export class LikePage {

  client:Client;
  contest:Contest;

  constructor(params:NavParams) {
    this.client = Client.getInstance();
    if (params && params.data) {
      this.contest = params.data.contest;
    }
  }

  onPageWillEnter() {
    this.client.logEvent('page/like',{'contestId' : this.contest._id});
  }

  like() {
    this.client.logEvent('like/click');
    window.open(this.client.settings.general.facebookFanPage, '_new');
  }
}
