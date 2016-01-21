import {Page,NavParams} from 'ionic/ionic';
import {Client} from '../../providers/client';
import * as facebookService from '../../providers/facebook';

@Page({
  templateUrl: 'build/pages/facebook-post/facebook-post.html'
})
export class FacebookPostPage {

  client:Client;
  quizResults:Object;

  constructor(params:NavParams) {
    this.client = Client.getInstance();
    this.quizResults = params.data.quizResults;
  }

  post() {
    facebookService.post(this.quizResults.data.facebookPost).then((response) => {
      this.close();
    }, (error) => {
      FlurryAgent.myLogError("FacebookPostError", "Error posting: " + error);
    })
  }

}
