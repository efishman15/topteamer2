import {Component,ViewChild} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {ContestChartComponent} from '../../components/contest-chart/contest-chart';
import {ContestDetailsComponent} from '../../components/contest-details/contest-details';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as alertService from '../../providers/alert';
import * as soundService from '../../providers/sound';
import {Contest,QuizResults} from '../../objects/objects';

@Component({
  templateUrl: 'build/pages/contest/contest.html',
  directives: [ContestChartComponent, ContestDetailsComponent]
})

export class ContestPage {

  client:Client;
  contest:Contest;
  lastQuizResults:QuizResults = null;
  animateLastResults:boolean = false;
  playText: string;

  @ViewChild(ContestChartComponent) contestChartComponent:ContestChartComponent;
  @ViewChild(ContestDetailsComponent) contestDetailsComponent:ContestDetailsComponent;

  constructor(params:NavParams) {

    this.client = Client.getInstance();
    this.contest = params.data.contest;
    this.setPlayText();

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
      //Event data comes as an array of data objects - we expect only one (contest)
      this.refreshContestChart(eventData[0]);
      this.setPlayText();

    });
  }

  ionViewWillEnter() {
    this.client.logEvent('page/contest',{'contestId' : this.contest._id});
  }

  ionViewWillLeave() {
    this.animateLastResults = false;
    this.lastQuizResults = null;
  }

  playContest(source) {

    if (this.contest.myTeam !== 0 && this.contest.myTeam !== 1) {
      alertService.alert({'type': 'SERVER_ERROR_NOT_JOINED_TO_CONTEST'});
      return;
    }

    this.client.logEvent('contest/play', {
      'contestId': this.contest._id,
      'team': '' + this.contest.myTeam,
      'sourceClick': source
    });

    this.client.openPage('QuizPage', {'contest': this.contest, 'source': source});
  }

  showParticipants(source) {
    this.client.openPage('ContestParticipantsPage', {'contest': this.contest, 'source': source});
  }

  joinContest(team, source, action:string = 'join') {

    contestsService.join(this.contest._id, team).then((data: any) => {

      this.setPlayText();

      this.client.logEvent('contest/' + action, {
        'contestId': this.contest._id,
        'team': '' + this.contest.myTeam,
        'sourceClick': source
      });

      //Should also cause refresh internally to our contest chart as well as notifying the tabs outside
      this.client.events.publish('topTeamer:contestUpdated', data.contest, data.contest.status, data.contest.status);

      //Should get xp if fresh join
      var rankModal;
      if (data.xpProgress && data.xpProgress.addition > 0) {
        this.client.addXp(data.xpProgress).then(() => {
          if (data.xpProgress.rankChanged) {
            rankModal = this.client.createModalPage('NewRankPage', {
              'xpProgress': data.xpProgress
            });
          }
        })
      }

      if (action === 'switchTeams') {
        alertService.alert({'type': 'SWITCH_TEAMS_ALERT', 'additionalInfo': {'team': this.contest.teams[this.contest.myTeam].name}}).then(() => {
          if (rankModal) {
            this.client.nav.present(rankModal);
          }
        });
      }
      else if (rankModal) {
        this.client.nav.present(rankModal);
      }

    }, () => {

    });
  }

  refreshContestChart(contest) {
    this.contest = contest;
    this.contestChartComponent.refresh(contest);
    this.contestDetailsComponent.refresh(contest);
  }

  switchTeams(source) {
    this.joinContest(1 - this.contest.myTeam, source, 'switchTeams');
  }

  editContest() {
    this.client.logEvent('contest/edit/click', {'contestId' : this.contest._id});
    this.client.openPage('SetContestPage', {'mode': 'edit', 'contest': this.contest});
  }

  share(source) {
    this.client.share(this.contest.status !== 'finished' ? this.contest : null, source);
  }

  like() {
    this.client.logEvent('like/click');
    window.open(this.client.settings.general.facebookFanPage, '_new');
  }

  setPlayText() {
    switch (this.contest.state) {
      case 'play':
        this.playText = this.client.translate('PLAY_FOR_TEAM',{'team': this.contest.teams[this.contest.myTeam].name});
        break;
      case 'join':
        this.playText = this.client.translate('PLAY_CONTEST');
        break;
    }
  }

  onTeamSelected(data) {
    if (this.contest.myTeam === 0 || this.contest.myTeam === 1) {
      if (data.teamId !== this.contest.myTeam) {
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
    this.playContest(data.source);
  }

  onResize() {
    this.contestChartComponent.onResize();
  }
}
