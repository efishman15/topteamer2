import {Component} from '@angular/core';
import {NavParams,ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';
import * as connectService from '../../providers/connect';
import {QuizResults} from '../../objects/objects';

@Component({
  templateUrl: 'build/pages/facebook-post/facebook-post.html'
})
export class FacebookPostPage {

  client:Client;
  quizResults:QuizResults;
  viewController:ViewController;

  constructor(params:NavParams, viewController:ViewController) {
    this.viewController = viewController
    this.client = Client.getInstance();
    this.quizResults = params.data.quizResults;
  }

  //The only life cycle eve currently called in modals
  ngAfterViewInit() {
    this.client.logEvent('page/facebookPost', {'contestId': this.quizResults.contest._id, 'story': this.quizResults.data.clientKey});
  }

  post() {
    this.client.logEvent('contest/facebook/post/click');
    connectService.post(this.quizResults.data.facebookPost).then(() => {
      this.close(true);
    }, () => {
      //Do nothing - user probably canceled or any other error presented by facebook
      //Stay on screen
    })
  }

  close(posted: boolean) {
    if (!posted) {
      this.client.logEvent('contest/facebook/post/cancel');
    }
    this.viewController.dismiss();
  }
}
