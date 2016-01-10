import {Page, NavParams} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestChartComponent} from '../../components/contest-chart/contest-chart';
import {ContestParticipantsPage} from '../../pages/contest-participants/contest-participants';
import {QuizPage} from '../../pages/quiz/quiz';
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
    this.client.setPageTitle('WHO_SMARTER_QUESTION');
  }

  playContest(source) {
    this.client.nav.push(QuizPage, {'contestId' : this.contestChart.contest._id, 'source' : source});
  }

  showParticipants(source) {
    this.client.nav.push(ContestParticipantsPage, {'contest' : this.contestChart.contest, 'source' : source});
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

  share(source) {
    //TODO: share
    alert('share, source=' + source);
  }

  like() {
    //TODO: like
    alert('like');
  }

  onTeamSelected(data) {
    if (this.contestChart.contest.myTeam === 0 || this.contestChart.contest.myTeam === 1) {
      if (data.teamId !== this.contestChart.contest.myTeam) {
        this.switchTeams(data.source);
      }
      else {
        this.playContest(data.source);
      }
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
