import {Page, NavParams,Modal} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestChartComponent} from '../../components/contest-chart/contest-chart';
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

@Page({
  templateUrl: 'build/pages/contest/contest.html',
  directives: [ContestChartComponent]
})

export class ContestPage {

  client:Client;
  params:NavParams;
  contestChart:Object = {};
  lastQuizResults:Object = null;
  animateLastResults:Boolean = false;
  contestId:String;

  @ViewChild(ContestChartComponent) contestChartComponent:ContestChartComponent;

  constructor(params:NavParams) {

    this.client = Client.getInstance();
    this.params = params;

    if (this.params.data.contestChart) {
      this.contestId = this.params.contestChart.contest._id;
      this.contestChart = this.params.data.contestChart;
    }
    else if (this.params.data.contest) {
      //Just created this contest - no chart
      this.contestId = this.params.contest._id;
      this.contestChart = contestsService.prepareContestChart(this.params.data.contest);
    }
    else {
      //Retrieve contest by id
      this.contestId = this.params.contestId;
      contestsService.getContest(this.params.data.contestId).then((contest) => {
        this.contestChart = contestsService.prepareContestChart(contest);
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
    FlurryAgent.logEvent('page/contest',{'contestId' : this.contestId});
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

    contestsService.join(this.contestChart.contest._id, team).then((data) => {

      FlurryAgent.logEvent('contest/' + action, {
        'contestId': this.contestChart.contest._id,
        'team': '' + team,
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
    this.contestChart = contestsService.prepareContestChart(contest);
    this.contestChartComponent.refresh(this.contestChart);
  }

  switchTeams(source) {
    this.joinContest(1 - this.contestChart.contest.myTeam, source, 'switchTeams');
  }

  editContest() {
    this.client.nav.push(SetContestPage, {'mode': 'edit', 'contest': this.contestChart.contest});
  }

  share(source) {
    shareService.share(this.contestChart.contest);
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
