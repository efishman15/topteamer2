import {Page, NavParams, Events, Item, Modal} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestChartComponent} from '../../components/contest-chart/contest-chart';
import {ContestParticipantsPage} from '../../pages/contest-participants/contest-participants';
import {QuizPage} from '../../pages/quiz/quiz';
import {FacebookPostPage} from '../../pages/facebook-post/facebook-post';
import {LikePage} from '../../pages/like/like';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as shareService from '../../providers/share';
import * as soundService from '../../providers/sound';

@Page({
  templateUrl: 'build/pages/contest/contest.html',
  directives: [ContestChartComponent, Item]
})

export class ContestPage {

  client:Client;
  modal: Modal;
  contestChart:Object = {};
  lastQuizResults:Object = null;
  animateLastResults:Boolean = false;

  @ViewChild(ContestChartComponent) contestChartComponent:ContestChartComponent;

  constructor(params:NavParams, events:Events, modal: Modal) {

    this.modal = modal;
    this.client = Client.getInstance();
    this.contestChart = params.data.contestChart;

    events.subscribe('topTeamer:quizFinished', (eventData) => {
      //Event data comes as an array of data objects - we expect only one (last quiz results)

      this.lastQuizResults = eventData[0];

      //Exit from the quiz
      this.client.nav.pop();

      if (this.lastQuizResults.data.facebookPost) {
        this.animateLastResults = false;
        this.modal.open(FacebookPostPage, {'quizResults' : this.lastQuizResults}, {'handle' : 'facebookPost'});
      }
      else {
        //Exit from the quiz
        this.client.nav.pop();
        this.animateLastResults = true;
      }

      setTimeout(() => {
        soundService.play(this.lastQuizResults.data.sound);
      }, 500);

    });

  }

  onPageWillLeave() {
    this.animateLastResults = false;
    this.lastQuizResults = null;
  }

  playContest(source) {
    this.client.nav.push(QuizPage, {'contestId': this.contestChart.contest._id, 'source': source});
  }

  showParticipants(source) {
    this.client.nav.push(ContestParticipantsPage, {'contest': this.contestChart.contest, 'source': source});
  }

  joinContest(team, source, action:string = 'join') {

    var postData = {'contestId': this.contestChart.contest._id, 'teamId': team};
    this.client.serverPost('contests/join', postData).then((data) => {

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

    shareService.share(contest);
  }

  like() {
    this.client.nav.push(LikePage, {'contest': this.contestChart.contest});
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
