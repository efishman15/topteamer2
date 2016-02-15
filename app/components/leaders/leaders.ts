import {Client} from '../../providers/client';
import {Component} from 'angular2/core';
import {List, Item} from 'ionic/ionic';
import * as leaderboardsService from '../../providers/leaderboards';


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

  showFriends(friendsPermissionJustGranted : boolean) {
    leaderboardsService.friends(friendsPermissionJustGranted).then((leaders) => {
      this.leaders = leaders;
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
