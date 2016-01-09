import {IonicApp, Page, Component, NavParams} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestChartComponent} from '../../components/contest-chart/contest-chart';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';

@Page({
  templateUrl: 'build/pages/contest/contest.html',
  directives: [ContestChartComponent]
})

export class ContestPage {

  client:Client;
  contestChart:Object = {};

  @ViewChild(ContestChartComponent) contestChartComponent: ContestChartComponent;

  constructor(params:NavParams) {
    this.client = Client.getInstance();
    this.contestChart = params.data.contestChart;
  }

  onPageWillEnter() {
    this.client.ionicApp.setTitle(this.client.translate('WHO_SMARTER_QUESTION'));
  }

  playContest(source) {
    //TODO: play contest
    alert('play contest, source: ' + source);
  }

  showParticipants(source) {
    //TODO: show participants
    alert('show participants, source: ' + source);
  }

  joinContest(team, source, action : string = 'join') {

    var postData = {'contestId' : this.contestChart.contest._id, 'teamId': team};
    this.client.serverPost('contests/join', postData).then( (data) => {

      FlurryAgent.logEvent('contest/' + action, {
        'contestId': this.contestChart.contest._id,
        'team': '' + team,
        'sourceClick': source
      });

      this.contestChart = contestsService.prepareContestChart(data.contest, 'starts');
      this.contestChartComponent.refresh(this.contestChart);

    });
  }

  switchTeams(source) {
    this.joinContest(1 - this.contestChart.contest.myTeam, source, 'switchTeams');
  }

  editContest() {
    //TODO: edit contest
    alert('edit contest');
  }

  share() {
    //TODO: share
    alert('share');
  }

  like() {
    //TODO: like
    alert('like');
  }

  onTeamSelected(data) {
    if (this.contestChart.contest.myTeam === 0 || this.contestChart.contest.myTeam === 1) {
      this.switchTeams(data.source);
    }
    else {
      this.joinContest(data.teamId, data.source);
    }
  }

  onContestSelected(data) {
    if (this.contestChart.contest.myTeam === 0 || this.contestChart.contest.myTeam === 1) {
      this.playContest('chart');
    }
  }
}
