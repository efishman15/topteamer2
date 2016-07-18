import {Component,ViewChild} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {ContestChartComponent} from '../../components/contest-chart/contest-chart';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as alertService from '../../providers/alert';
import * as soundService from '../../providers/sound';
import {Contest,QuizResults} from '../../objects/objects';

@Component({
  templateUrl: 'build/pages/contest/contest.html',
  directives: [ContestChartComponent]
})

export class ContestPage {

  client:Client;
  contest:Contest;
  lastQuizResults:QuizResults = null;
  animateLastResults:boolean = false;

  @ViewChild(ContestChartComponent) contestChartComponent:ContestChartComponent;

  constructor(params:NavParams) {

    this.client = Client.getInstance();
    this.contest = params.data.contest;

    this.client.events.subscribe('topTeamer:quizFinished', (eventData) => {

      //Prepare some client calculated fields on the contest
      contestsService.setContestClientData(eventData[0].contest);

      //Refresh the contest chart and the contest details
      this.refreshContestChart(eventData[0].contest)

      //Event data comes as an array of data objects - we expect only one (last quiz results)
      this.lastQuizResults = eventData[0];

      if (this.lastQuizResults.data.facebookPost) {
        this.animateLastResults = false;
        this.client.showModalPage('FacebookPostPage', {'quizResults': this.lastQuizResults});
      }
      else {
        this.animateLastResults = true;
        setTimeout(() => {
          this.animateLastResults = false;
        }, this.client.settings.quiz.finish.animateResultsTimeout);
      }

      var soundFile = this.lastQuizResults.data.sound;
      setTimeout(() => {
        soundService.play(soundFile);
      }, 500);

    });

    this.client.events.subscribe('topTeamer:contestUpdated', (eventData) => {
      this.refreshContestChart(eventData[0]);
    });

  }

  ionViewWillEnter() {
    this.client.logEvent('page/contest',{'contestId' : this.contest._id});
  }

  ionViewWillLeave() {
    this.animateLastResults = false;
    this.lastQuizResults = null;
  }

  showParticipants(source) {
    this.client.openPage('ContestParticipantsPage', {'contest': this.contest, 'source': source});
  }

  refreshContestChart(contest) {
    this.contest = contest;
    this.contestChartComponent.refresh(contest);
  }

  share(source) {
    this.client.share(this.contest.status !== 'finished' ? this.contest : null, source);
  }

  like() {
    this.client.logEvent('like/click');
    window.open(this.client.settings.general.facebookFanPage, '_new');
  }

  editContest() {
    this.client.logEvent('contest/edit/click', {'contestId' : this.contest._id});
    this.client.openPage('SetContestPage', {'mode': 'edit', 'contest': this.contest});
  }

  switchTeams() {
    this.contestChartComponent.switchTeams('contest/switchTeams');
  }

  onContestSelected() {
    this.playOrLeaderboard('contest/chart');
  }

  onMyTeamSelected() {
    this.playContest('contest/myTeam');
  }

  onContestButtonClick() {
    this.playOrLeaderboard('contest/button');
  }

  playOrLeaderboard(source: string) {
    if (this.contest.state === 'play') {
      this.playContest(source);
    }
    else if (this.contest.state === 'finished') {
      this.showParticipants(source);
    }
  }

  playContest(source) {

    this.client.logEvent('contest/play', {
      'contestId': this.contest._id,
      'team': '' + this.contest.myTeam,
      'sourceClick': source
    });

    this.client.openPage('QuizPage', {'contest': this.contest, 'source': source});
  }

  onResize() {
    this.contestChartComponent.onResize();
  }
}
