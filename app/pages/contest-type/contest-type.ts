import {Page, Component} from 'ionic/ionic';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/contest-type/contest-type.html'
})
export class ContestTypePage {

  client:Client;

  constructor() {
    this.client = Client.getInstance();
  }

  selectContestContent(contest) {
    this.close();
    this.client.events.publish('topTeamer:contestTypeSelected', contest);
  }

}
