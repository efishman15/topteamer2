import {Page,NavParams} from 'ionic/ionic';
import {PlayerInfoComponent} from '../../components/player-info/player-info';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/like/like.html',
  directives: [PlayerInfoComponent]
})
export class LikePage {

  client:Client;
  contest:Object;

  constructor(params:NavParams) {
    this.client = Client.getInstance();
    if (params && params.data) {
      this.contest = params.data.contest;
    }
  }

}
