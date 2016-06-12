import {Component} from '@angular/core';
import {ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';

@Component({
  templateUrl: 'build/pages/contest-type/contest-type.html'
})
export class ContestTypePage {

  client:Client;
  viewController: ViewController;

  constructor(viewController: ViewController) {
    this.client = Client.getInstance();
    this.viewController = viewController;
  }

  //The only life cycle event currently called in modals
  ngAfterViewInit() {
    this.client.logEvent('page/contestType');
  }

  selectContestContent(contestTypeId) {
    this.client.logEvent('newContest/type/' + (contestTypeId ? contestTypeId : 'cancel'));
    this.viewController.dismiss(contestTypeId);
  }

}
