import {Component, Input} from 'angular2/core';
import {Client} from '../../providers/client';

@Component({
  selector: 'contest-leaders',
  templateUrl: 'build/components/contest-leaders/contest-leaders.html'
})

export class ContestLeadersComponent {

  leaders:Array<Object>;

  client:Client;

  constructor() {
    this.client = Client.getInstance();
  }

  showFriends(friendsPermissionJustGranted : boolean) {
    var postData = {};
    if (friendsPermissionJustGranted) {
      postData.friendsPermissionJustGranted = friendsPermissionJustGranted;
    }
    this.client.serverPost('leaderboard/friends', postData).then((leaders) => {
      this.leaders = leaders;
    });
  }

  showWeekly() {
    this.client.serverPost('leaderboard/weekly').then((leaders) => {
      this.leaders = leaders;
    });
  }

  //If teamId is not passed - general contest leaderboard is shown
  showContestParticipants(contestId: string, teamId? : number) {
    var postData = {'contestId' : contestId};
    if (teamId === 0 || teamId === 1) {
      postData.teamId = teamId;
    }
    this.client.serverPost('leaderboard/contest', postData).then((leaders) => {
      this.leaders = leaders;
    });
  }

}
