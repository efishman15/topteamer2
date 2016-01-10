import {Page} from 'ionic/ionic';
import {ContestLeadersComponent} from '../../components/contest-leaders/contest-leaders';
import {SimpleTabsComponent} from '../../components/simple-tabs/simple-tabs';
import {SimpleTabComponent} from '../../components/simple-tab/simple-tab';
import {ViewChild} from 'angular2/core';
import {Client} from '../../providers/client';
import {NavParams} from "ionic-framework/ionic";

@Page({
  templateUrl: 'build/pages/contest-participants/contest-participants.html',
  directives: [SimpleTabsComponent, SimpleTabComponent,ContestLeadersComponent]
})
export class ContestParticipantsPage {

  client:Client;

  @ViewChild(ContestLeadersComponent) contestLeadersComponent : ContestLeadersComponent;

  contest:Object;
  source:string;

  constructor(params:NavParams) {
    // set the root pages for each tab
    this.contest = params.data.contest;
    this.source = params.data.source;

    this.client = Client.getInstance();
    this.client.setPageTitle('CONTEST_LEADERS');
  }

  onPageDidEnter() {
    this.showContestParticipants();
  }

  showContestParticipants() {
    FlurryAgent.logEvent('contest/participants/' + this.source + '/leaderboard/all');
    this.contestLeadersComponent.showContestParticipants(this.contest._id)
  }

  showTeamParticipants(teamId) {
    FlurryAgent.logEvent('contest/participants/' + this.source + '/leaderboard/team' + teamId);
    this.contestLeadersComponent.showContestParticipants(this.contest._id, teamId);
  }
}
