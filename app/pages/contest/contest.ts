import {Page, NavParams,Modal} from 'ionic-angular';
import {ViewChild} from 'angular2/core';
import {ContestChartComponent} from '../../components/contest-chart/contest-chart';
import {ContestParticipantsPage} from '../../pages/contest-participants/contest-participants';
import {QuizPage} from '../../pages/quiz/quiz';
import {SetContestPage} from '../../pages/set-contest/set-contest';
import {FacebookPostPage} from '../../pages/facebook-post/facebook-post';
import {NewRankPage} from '../../pages/new-rank/new-rank'
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as alertService from '../../providers/alert';
import * as shareService from '../../providers/share';
import * as soundService from '../../providers/sound';
import {Contest,QuizResults} from '../../objects/objects';

@Page({
  templateUrl: 'build/pages/contest/contest.html',
  directives: [ContestChartComponent]
})

export class ContestPage {

  client:Client;
  params:NavParams;
  contest:Contest;
  lastQuizResults:QuizResults = null;
  animateLastResults:Boolean = false;
  contestId:String;
  playText: string;

  @ViewChild(ContestChartComponent) contestChartComponent:ContestChartComponent;

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
      this.contest = eventData[0];
      this.refreshContestChart(eventData[0]);

    });
  }

  ngOnInit() {
    this.setPlayText();
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

      this.contest = data.contest;
      this.refreshContestChart(data.contest);
      this.setPlayText();

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
          if (data.xpProgress.rankChanged) {
            var modal = Modal.create(NewRankPage, {
              'xpProgress': data.xpProgress
            });
            this.client.nav.present(modal);
          }
        })
      }
    });
  }

  refreshContestChart(contest) {
    this.contestChartComponent.refresh(contest.dataSource);
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
    if (this.contest.myTeam === 0 || this.contest.myTeam === 1) {
      this.playContest(data.source);
    }
    else {
      alertService.alert({'type': 'SERVER_ERROR_NOT_JOINED_TO_CONTEST'});
    }
  }
}
