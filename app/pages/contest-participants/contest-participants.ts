import {Page,NavParams} from 'ionic/ionic';
import {PlayerInfoComponent} from '../../components/player-info/player-info';
import {LeadersComponent} from '../../components/leaders/leaders';
import {SimpleTabsComponent} from '../../components/simple-tabs/simple-tabs';
import {SimpleTabComponent} from '../../components/simple-tab/simple-tab';
import {ViewChild} from 'angular2/core';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/contest-participants/contest-participants.html',
  directives: [PlayerInfoComponent,SimpleTabsComponent, SimpleTabComponent,LeadersComponent]
})
export class ContestParticipantsPage {

  client:Client;

  @ViewChild(LeadersComponent) leadersComponent : LeadersComponent;

  contest:Object;
  source:string;

  constructor(params:NavParams) {
    // set the root pages for each tab
    this.contest = params.data.contest;
    this.source = params.data.source;

    this.client = Client.getInstance();
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
    FlurryAgent.logEvent('contest/participants/' + this.source + '/leaderboard/all');
    this.leadersComponent.showContestParticipants(this.contest._id)
  }

  showTeamParticipants(teamId) {
    FlurryAgent.logEvent('contest/participants/' + this.source + '/leaderboard/team' + teamId);
    this.leadersComponent.showContestParticipants(this.contest._id, teamId);
  }
}
