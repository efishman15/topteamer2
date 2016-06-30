import {Component} from '@angular/core';
import {NavParams, Refresher} from 'ionic-angular';
import {LeadersComponent} from '../../components/leaders/leaders';
import {SimpleTabsComponent} from '../../components/simple-tabs/simple-tabs';
import {SimpleTabComponent} from '../../components/simple-tab/simple-tab';
import {ViewChild} from '@angular/core';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import {Contest} from '../../objects/objects';

@Component({
  templateUrl: 'build/pages/contest-participants/contest-participants.html',
  directives: [SimpleTabsComponent, SimpleTabComponent,LeadersComponent]
})
export class ContestParticipantsPage {

  client:Client;
  params: NavParams;
  tabId: number; //-1=general contest, 0=team0, 1=team1

  @ViewChild(LeadersComponent) leadersComponent : LeadersComponent;

  constructor(params:NavParams) {
    this.client = Client.getInstance();
    this.params = params;
  }

  ionViewWillEnter() {
    this.client.logEvent('page/contestParticipants',{'contestId' : this.params.data.contest._id});
    if (this.leadersComponent) {
      return this.tabGeneralParticipants();
    }
  }

  tabGeneralParticipants() {
    this.tabId = -1;
    return this.showContestParticipants(false);
  }

  tabTeamParticipants(teamId: number) {
    this.tabId = teamId;
    return this.showTeamParticipants(teamId, false);
  }

  showContestParticipants(forceRefresh? : boolean) {
    this.client.logEvent('contest/participants/' + this.params.data.source + '/leaderboard/all');
    return this.leadersComponent.showContestParticipants(this.params.data.contest._id, null, forceRefresh)
  }

  showTeamParticipants(teamId, forceRefresh? :boolean) {
    this.client.logEvent('contest/participants/' + this.params.data.source + '/leaderboard/team' + teamId);
    return this.leadersComponent.showContestParticipants(this.params.data.contest._id, teamId, forceRefresh);
  }

  doRefresh(refresher: Refresher) {
    switch(this.tabId) {
      case -1:
        this.showContestParticipants(true).then(() => {
          refresher.complete();
        }, () => {
          refresher.complete();
        });
        break;
      case 0:
      case 1:
        this.showTeamParticipants(this.tabId, true).then (() => {
          refresher.complete();
        },() => {
          refresher.complete();
        });
        break;
    }
  }
}
