import {Component} from '@angular/core';
import {NavParams,ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';
import * as facebookService from '../../providers/facebook';
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
    facebookService.post(this.quizResults.data.facebookPost).then((response) => {
      this.close();
    }, (error) => {
      window.myLogError('FacebookPostError', 'Error posting: ' + error);
    })
  }

  close() {
    this.client.logEvent('contest/facebook/post/cancel');
    this.viewController.dismiss();
  }
}
