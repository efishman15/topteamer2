import {Page, NavParams,Modal} from 'ionic-angular';
import {ViewChild} from 'angular2/core';
import {ContestChartDetailedComponent} from '../../components/contest-chart/detailed/contest-chart-detailed';
import {ContestParticipantsPage} from '../../pages/contest-participants/contest-participants';
import {QuizPage} from '../../pages/quiz/quiz';
import {SetContestPage} from '../../pages/set-contest/set-contest';
import {FacebookPostPage} from '../../pages/facebook-post/facebook-post';
import {LikePage} from '../../pages/like/like';
import {NewRankPage} from '../../pages/new-rank/new-rank'
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as shareService from '../../providers/share';
import * as soundService from '../../providers/sound';
import {Contest,QuizResults} from '../../objects/objects';

@Page({
  templateUrl: 'build/pages/contest/contest.html',
  directives: [ContestChartDetailedComponent]
})

export class ContestPage {

  client:Client;
  params:NavParams;
  contest:Contest;
  lastQuizResults:QuizResults = null;
  animateLastResults:Boolean = false;
  contestId:String;

  @ViewChild(ContestChartDetailedComponent) contestChartDetailedComponent:ContestChartDetailedComponent;

  constructor(params:NavParams) {

    this.client = Client.getInstance();
    this.params = params;

    if (this.params.data.contest) {
      this.contestId = this.params.data.contest._id;
      this.contest = this.params.data.contest;
    }
    else {
      //Retrieve contest by id
      this.contestId = this.params.data.contestId;
      contestsService.getContest(this.params.data.contestId).then((contest) => {
        this.contest = contest;
      });
    }

    this.client.events.subscribe('topTeamer:quizFinished', (eventData) => {
      //Event data comes as an array of data objects - we expect only one (last quiz results)

      this.lastQuizResults = eventData[0];

      if (this.lastQuizResults.data.facebookPost) {
        this.animateLastResults = false;
        var modal = Modal.create(FacebookPostPage, {'quizResults': this.lastQuizResults});
        this.client.nav.present(modal);
      }
      else {
        this.animateLastResults = true;
      }

      var soundFile = this.lastQuizResults.data.sound;
      setTimeout(() => {
        soundService.play(soundFile);
      }, 500);

    });

    this.client.events.subscribe('topTeamer:contestUpdated', (eventData) => {
      //Event data comes as an array of data objects - we expect only one (contest)
      this.refreshContest(eventData[0]);

    });
  }

  onPageWillEnter() {
    this.client.logEvent('page/contest',{'contestId' : this.contestId});
  }

  onPageWillLeave() {
    this.animateLastResults = false;
    this.lastQuizResults = null;
  }

  playContest(source) {
    this.client.logEvent('contest/play', {
      'contestId': this.contest._id,
      'team': '' + this.contest.myTeam,
      'sourceClick': source
    });
    this.client.nav.push(QuizPage, {'contest': this.contest, 'source': source});
  }

  showParticipants(source) {
    this.client.nav.push(ContestParticipantsPage, {'contest': this.contest, 'source': source});
  }

  joinContest(team, source, action:string = 'join') {

    contestsService.join(this.contest._id, team).then((data) => {

      this.client.logEvent('contest/' + action, {
        'contestId': this.contest._id,
        'team': '' + this.contest.myTeam,
        'sourceClick': source
      });

      //Should also cause refresh internally to our contest chart as well as notifying the tabs outside
      this.client.events.publish('topTeamer:contestUpdated', data.contest);

      //Should get xp if fresh join
      if (data.xpProgress && data.xpProgress.addition > 0) {
        this.client.addXp(data.xpProgress).then(() => {
          var modal = Modal.create(NewRankPage, {
            'xpProgress': data.xpProgress
          });
          this.client.nav.present(modal);
        })
      }
    });
  }

  refreshContest(contest) {
    this.contestChartDetailedComponent.refresh(contest.chartControl);
  }

  switchTeams(source) {
    this.joinContest(1 - this.contest.myTeam, source, 'switchTeams');
  }

  editContest() {
    this.client.logEvent('contest/edit/click', {'contestId' : this.contest._id});
    this.client.nav.push(SetContestPage, {'mode': 'edit', 'contest': this.contest});
  }

  share(source) {
    shareService.share(source, this.contest);
  }

  like() {
    this.client.logEvent('contest/like/click', {'contestId' : this.contest._id});
    this.client.nav.push(LikePage, {'contest': this.contest});
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
    if (this.contest.myTeam === 0 || this.contest.myTeam === 1) {
      this.playContest(data.source);
    }
    else {
      alert('TBD - select team dialog');
    }
  }
}
