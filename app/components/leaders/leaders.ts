import {Client} from '../../providers/client';
import {Component} from '@angular/core';
import {List, Item} from 'ionic-angular';
import * as leaderboardsService from '../../providers/leaderboards';
import * as facebookService from '../../providers/facebook';


@Component({
  selector: 'leaders',
  templateUrl: 'build/components/leaders/leaders.html',
  directives: [List, Item]
})

export class LeadersComponent {

  leaders:Array<Object>;
  client:Client;

  constructor() {
    this.client = Client.getInstance();
  }

  showFriends(friendsPermissionJustGranted? : boolean) {
    leaderboardsService.friends(friendsPermissionJustGranted).then((leaders) => {
      this.leaders = leaders;
    }, (err) => {
      if (err.type === 'SERVER_ERROR_MISSING_FRIENDS_PERMISSION' && err.additionalInfo && err.additionalInfo.confirmed) {
        facebookService.login(this.client.settings.facebook.friendsPermission, true).then((response) => {
          this.showFriends(true);
        })
      }
    });
  }

  showWeekly() {
    leaderboardsService.weekly().then((leaders) => {
      this.leaders = leaders;
    });
  }

  //If teamId is not passed - general contest leaderboard is shown
  showContestParticipants(contestId: string, teamId? : number) {
    leaderboardsService.contest(contestId, teamId).then((leaders) => {
      this.leaders = leaders;
    });
  }
}
