import {Page,NavParams,ViewController} from 'ionic/ionic';
import {PlayerInfoComponent} from '../../components/player-info/player-info';
import {Client} from '../../providers/client';
import * as facebookService from '../../providers/facebook';

@Page({
  templateUrl: 'build/pages/facebook-post/facebook-post.html',
  directives: [PlayerInfoComponent]
})
export class FacebookPostPage {

  client:Client;
  quizResults:Object;
  viewController:ViewController;

  constructor(params:NavParams, viewController:ViewController) {
    this.viewController = viewController
    this.client = Client.getInstance();
    this.quizResults = params.data.quizResults;
  }

  post() {
    facebookService.post(this.quizResults.data.facebookPost).then((response) => {
      this.close();
    }, (error) => {
      FlurryAgent.myLogError('FacebookPostError', 'Error posting: ' + error);
    })
  }

  close() {
    this.viewController.dismiss();
  }
}
