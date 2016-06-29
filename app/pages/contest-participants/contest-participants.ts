import {Component} from '@angular/core';
import {NavParams} from 'ionic-angular';
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

  @ViewChild(LeadersComponent) leadersComponent : LeadersComponent;

  contest:Contest;
  source:string;
  contestId: String;

  constructor(params:NavParams) {
    // set the root pages for each tab
    this.source = params.data.source;
    this.client = Client.getInstance();

    if (params.data.contest) {
      this.contest = params.data.contest;
      this.contestId = params.data.contest._id;
    }
    else {
      this.contestId = params.data.contestId;
      contestsService.getContest(params.data.contestId).then((contest: Contest) => {
        this.contest = contest;
      }, () => {
        setTimeout(() => {
          this.client.nav.pop();
        },1000)
      });
    }
  }

  ionViewWillEnter() {
    this.client.logEvent('page/contestParticipants',{'contestId' : this.contestId});
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

    this.client.logEvent('contest/participants/' + this.source + '/leaderboard/all');
    this.leadersComponent.showContestParticipants(this.contest._id)

  }

  showTeamParticipants(teamId) {
    this.client.logEvent('contest/participants/' + this.source + '/leaderboard/team' + teamId);
    this.leadersComponent.showContestParticipants(this.contest._id, teamId);
  }
}
