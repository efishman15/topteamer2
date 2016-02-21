import {Page,NavParams} from 'ionic/ionic';
import {LeadersComponent} from '../../components/leaders/leaders';
import {SimpleTabsComponent} from '../../components/simple-tabs/simple-tabs';
import {SimpleTabComponent} from '../../components/simple-tab/simple-tab';
import {ViewChild} from 'angular2/core';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';

@Page({
  templateUrl: 'build/pages/contest-participants/contest-participants.html',
  directives: [SimpleTabsComponent, SimpleTabComponent,LeadersComponent]
})
export class ContestParticipantsPage {

  client:Client;

  @ViewChild(LeadersComponent) leadersComponent : LeadersComponent;

  contest:Object;
  source:string;

  constructor(params:NavParams) {
    // set the root pages for each tab
    this.source = params.data.source;
    this.client = Client.getInstance();

    if (params.data.contest) {
      this.contest = params.data.contest;
    }
    else {
      contestsService.getContest(params.data.contestId).then((contest) => {
        this.contest = contest;
      });
    }
  }

  onPageWillEnter() {
    if (this.leadersComponent) {
      this.showContestParticipants();
    }
  }

  ngAfterViewInit() {
    this.showContestParticipants();
  }

  showContestParticipants() {

    if (!this.contest) {
      //In case contest has not been loaded yet
      setTimeout(() => {
        this.showContestParticipants();
      },500)
      return;
    }

    FlurryAgent.logEvent('contest/participants/' + this.source + '/leaderboard/all');
    this.leadersComponent.showContestParticipants(this.contest._id)

  }

  showTeamParticipants(teamId) {
    FlurryAgent.logEvent('contest/participants/' + this.source + '/leaderboard/team' + teamId);
    this.leadersComponent.showContestParticipants(this.contest._id, teamId);
  }
}
