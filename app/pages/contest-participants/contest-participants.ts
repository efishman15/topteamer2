import {Page} from 'ionic/ionic';
import {LeadersComponent} from '../../components/leaders/leaders';
import {SimpleTabsComponent} from '../../components/simple-tabs/simple-tabs';
import {SimpleTabComponent} from '../../components/simple-tab/simple-tab';
import {ViewChild} from 'angular2/core';
import {Client} from '../../providers/client';
import {NavParams} from "ionic-framework/ionic";

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
    this.contest = params.data.contest;
    this.source = params.data.source;

    this.client = Client.getInstance();
  }

  onPageDidEnter() {
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