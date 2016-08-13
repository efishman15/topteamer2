import {Component,ViewChild} from '@angular/core';
import {NavParams,Modal} from 'ionic-angular';
import {ContestChartComponent} from '../../components/contest-chart/contest-chart';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as analyticsService from '../../providers/analytics';
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
  animateLastResults:number = 0; //0=no animation, 1=enter animation, 2=exit animation

  @ViewChild(ContestChartComponent) contestChartComponent:ContestChartComponent;

  constructor(params:NavParams) {

    this.client = Client.getInstance();
    this.contest = params.data.contest;

    this.client.events.subscribe('topTeamer:quizFinished', (eventData) => {

      //Prepare some client calculated fields on the contest
      contestsService.setContestClientData(eventData[0].contest);

      //Refresh the contest chart and the contest details
      //This is the only case where we want to animate the chart
      //right after a quiz so the user will notice the socre changes
      this.refreshContestChart(eventData[0].contest, eventData[0].data.animation);

      //Event data comes as an array of data objects - we expect only one (last quiz results)
      this.lastQuizResults = eventData[0];

      if (this.lastQuizResults.data.facebookPost) {
        let shareSuccessModal:Modal = this.client.createModalPage('ShareSuccessPage', {'quizResults': this.lastQuizResults});
        shareSuccessModal.onDidDismiss((doShare:boolean) => {
          this.animateLastResults = 0;
          if (doShare) {
            this.share('shareSuccess');
          }
        });
        shareSuccessModal.present();
      }
      else {
        this.animateLastResults = 1; //Enter animation
        setTimeout(() => {
          this.animateLastResults = 2; //Exit animation
          setTimeout(() => {
            this.animateLastResults = 0; //No animation
          },this.client.settings.quiz.finish.animateResultsExitTimeout)
        }, this.client.settings.quiz.finish.animateResultsTimeout);
      }

      var soundFile = this.lastQuizResults.data.sound;
      setTimeout(() => {
        soundService.play(soundFile);
      }, 500);

    });

  }

  ionViewWillEnter() {
    analyticsService.track('page/contest', {contestId: this.contest._id});
  }

  showParticipants(source) {
    this.client.openPage('ContestParticipantsPage', {'contest': this.contest, 'source': source});
  }

  refreshContestChart(contest:Contest, animation?:string) {
    this.contest = contest;
    this.contestChartComponent.refresh(contest, animation);
  }

  share(source) {
    this.client.share(this.contest.status !== 'finished' ? this.contest : null, source);
  }

  onContestSelected() {
    this.playOrLeaderboard('contest/chart');
  }

  onMyTeamSelected() {
    this.playContest('contest/myTeam');
  }

  onContestButtonClick(data) {
    this.playOrLeaderboard('contest/button');
  }

  playOrLeaderboard(source:string) {
    if (this.contest.state === 'play') {
      this.playContest(source);
    }
    else if (this.contest.state === 'finished') {
      this.showParticipants(source);
    }
  }

  playContest(source) {

    analyticsService.track('contest/play', {
      contestId: this.contest._id,
      team: '' + this.contest.myTeam,
      sourceClick: source
    });

    this.client.openPage('QuizPage', {'contest': this.contest, 'source': source});
  }
}
