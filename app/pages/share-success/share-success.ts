import {Component} from '@angular/core';
import {NavParams,ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';
import * as analyticsService from '../../providers/analytics';
import {QuizResults} from '../../objects/objects';

@Component({
  templateUrl: 'build/pages/share-success/share-success.html'
})
export class ShareSuccessPage {

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
    analyticsService.track('page/shareSuccess', {'contestId': this.quizResults.contest._id, 'story': this.quizResults.data.clientKey});
  }

  share() {
    if (this.client.user.credentials.type === 'facebook') {
      analyticsService.track('contest/shareSuccess/facebookPost/click');
      this.close('post');
    }
    else {
      analyticsService.track('contest/shareSuccess/share/click');
      this.close('share');
    }
  }

  close(action:string) {
    if (action === 'cancel') {
      analyticsService.track('contest/shareSuccess/cancel/click');
    }
    return this.viewController.dismiss(action);
  }
}
