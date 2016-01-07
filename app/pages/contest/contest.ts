import {IonicApp, Page, Component, NavParams} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestChartComponent} from '../../components/contest-chart/contest-chart';
import {Server} from '../../providers/server';

@Page({
  templateUrl: 'build/pages/contest/contest.html',
  directives: [ContestChartComponent]
})

export class ContestPage {

  server:Server;
  app:IonicApp;
  contestChart:Object = {};

  constructor(app:IonicApp, params:NavParams) {
    this.app = app;
    this.server = Server.getInstance();
    this.contestChart = params.data.contestChart;
  }

  onPageWillEnter() {
    this.app.setTitle(this.server.translate('WHO_SMARTER_QUESTION'));
  }

  playContest(source) {
    //TODO: play contest
    alert('play contest, source: ' + source);
  }

  showParticipants(source) {
    //TODO: show participants
    alert('show participants, source: ' + source);
  }

  joinContest(team, source) {
    //TODO: join contest
    alert('join contest, team:' + team + ", source:" + source);
  }

  switchTeams(source) {
    //TODO: switch teams
    alert('switch teams, source:' + source);
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
