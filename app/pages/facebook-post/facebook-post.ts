import {Page,NavParams,ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';
import * as facebookService from '../../providers/facebook';

@Page({
  templateUrl: 'build/pages/facebook-post/facebook-post.html'
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

  onPageWillEnter() {
    this.client.logEvent('page/facebookPost', {'contestId': this.quizResults.contest._id, 'story': this.quizResults.data.clientKey});
  }

  post() {
    this.client.logEvent('contest/facebook/post/click');
    facebookService.post(this.quizResults.data.facebookPost).then((response) => {
      this.close();
    }, (error) => {
      this.client.logError('FacebookPostError', 'Error posting: ' + error);
    })
  }

  close() {
    this.client.logEvent('contest/facebook/post/cancel');
    this.viewController.dismiss();
  }
}
