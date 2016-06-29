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
  lastFriendsLeaders:Array<Object>;
  lastWeeklyLeaders:Array<Object>;
  lastGeneralContestLeaders:Array<Object>;
  lastTeam0ContestLeaders:Array<Object>;
  lastTeam1ContestLeaders:Array<Object>;
  client:Client;
  friendsLastRefreshTime;
  weeklyLastRefreshTime;
  generalContestLastRefreshTime;
  team0ContestLastRefreshTime;
  team1ContestLastRefreshTime;

  constructor() {
    this.client = Client.getInstance();
    this.friendsLastRefreshTime = 0;
    this.weeklyLastRefreshTime = 0;
    this.generalContestLastRefreshTime = 0; //should apply only to the contest currently shown - when view closes and another contest appears - should refresh from server again
    this.team0ContestLastRefreshTime = 0; //should apply only to the contest currently shown - when view closes and another contest appears - should refresh from server again
    this.team1ContestLastRefreshTime = 0; //should apply only to the contest currently shown - when view closes and another contest appears - should refresh from server again
  }

  showFriends(friendsPermissionJustGranted?:boolean) {
    var now = (new Date()).getTime();

    //Check if refresh frequency reached
    if (now - this.friendsLastRefreshTime < this.client.settings.lists.leaderboards.friends.refreshFrequencyInMilliseconds && !friendsPermissionJustGranted) {
      this.leaders = this.lastFriendsLeaders;
      return;
    }
    leaderboardsService.friends(friendsPermissionJustGranted).then((leaders) => {
      this.friendsLastRefreshTime = now;
      this.leaders = leaders;
      this.lastFriendsLeaders = leaders;
    }, (err) => {
      if (err.type === 'SERVER_ERROR_MISSING_FRIENDS_PERMISSION' && err.additionalInfo && err.additionalInfo.confirmed) {
        facebookService.login(this.client.settings.facebook.friendsPermission, true).then((response) => {
          this.showFriends(true);
        })
      }
    });
  }

  showWeekly(forceRefresh?:boolean) {
    var now = (new Date()).getTime();

    //Check if refresh frequency reached
    if (now - this.weeklyLastRefreshTime < this.client.settings.lists.leaderboards.weekly.refreshFrequencyInMilliseconds && !forceRefresh) {
      this.leaders = this.lastWeeklyLeaders;
      return;
    }
    leaderboardsService.weekly().then((leaders) => {
      this.weeklyLastRefreshTime = now;
      this.leaders = leaders;
      this.lastWeeklyLeaders = leaders;
    }, () => {

    });
  }

  //If teamId is not passed - general contest leaderboard is shown
  showContestParticipants(contestId:string, teamId?:number, forceRefresh?:boolean) {
    var now = (new Date()).getTime();

    var lastRefreshTime;
    var lastLeaders;
    switch (teamId) {
      case 0:
        lastRefreshTime = this.team0ContestLastRefreshTime;
        lastLeaders = this.lastTeam0ContestLeaders;
        break;
      case 1:
        lastRefreshTime = this.team1ContestLastRefreshTime;
        lastLeaders = this.lastTeam1ContestLeaders;
        break;

      default:
        lastRefreshTime = this.generalContestLastRefreshTime;
        lastLeaders = this.lastGeneralContestLeaders;
        break;
    }

    //Check if refresh frequency reached
    if (now - lastRefreshTime < this.client.settings.lists.leaderboards.contest.refreshFrequencyInMilliseconds && !forceRefresh) {
      this.leaders = lastLeaders;
      return;
    }
    leaderboardsService.contest(contestId, teamId).then((leaders) => {
      this.leaders = leaders;
      switch (teamId) {
        case 0:
          this.lastTeam0ContestLeaders = leaders;
          this.team0ContestLastRefreshTime = now;
          break;
        case 1:
          this.lastTeam1ContestLeaders = leaders;
          this.team1ContestLastRefreshTime = now;
          break;

        default:
          this.lastGeneralContestLeaders = leaders;
          this.generalContestLastRefreshTime = now;
          break;
      }
    }, () => {

    });
  }
}
