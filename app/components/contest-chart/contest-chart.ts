import {Component, Input, EventEmitter, Output} from '@angular/core';
import {Client} from '../../providers/client';
import * as alertService from '../../providers/alert';
import * as contestsService from '../../providers/contests';
import {Contest} from '../../objects/objects';

const WIDTH_MARGIN:number = 2;

@Component({
  selector: 'contest-chart',
  templateUrl: 'build/components/contest-chart/contest-chart.html'
})

export class ContestChartComponent {

  @Input() id:Number;
  @Input() contest:Contest;
  @Input() finishedStateButtonText:string;

  chartTeamEventHandled:boolean;
  client:Client;
  chart:any;
  buttonText:string;
  netChartHeight:number;
  teamsOrder:Array<number>;

  @Output() contestSelected = new EventEmitter();
  @Output() myTeamSelected = new EventEmitter();
  @Output() contestButtonClick = new EventEmitter();

  events:Object = {
    'dataplotClick': (eventObj, dataObj) => {
      var teamId = dataObj.dataIndex;
      if (this.client.currentLanguage.direction === 'rtl') {
        teamId = 1 - teamId;
      }
      this.teamSelected(teamId, 'bar');
      this.chartTeamEventHandled = true;
    },
    'dataLabelClick': (eventObj, dataObj) => {
      var teamId = dataObj.dataIndex;
      if (this.client.currentLanguage.direction === 'rtl') {
        teamId = 1 - teamId;
      }
      this.teamSelected(teamId, 'label');
      this.chartTeamEventHandled = true;
    },
    'chartClick': (eventObj, dataObj) => {
      if (!this.chartTeamEventHandled) {
        this.onContestSelected('chart');
      }
      this.chartTeamEventHandled = false;
    }
  };

  constructor() {
    this.client = Client.getInstance();

  }

  onContestSelected(source:string) {
    if (this.contest.state === 'join') {
      alertService.alert({'type': 'SERVER_ERROR_NOT_JOINED_TO_CONTEST'});
    }
    else {
      this.contestSelected.emit({'contest': this.contest, 'source': source});
    }
  }

  teamSelected(teamId:number, source:string) {
    if (this.contest.state === 'play') {
      if (teamId !== this.contest.myTeam) {
        this.switchTeams(source);
      }
      else {
        //My team - start the game
        this.client.logEvent('contest/myTeam', {
          'contestId': this.contest._id,
          'team': '' + this.contest.myTeam,
          'sourceClick': source
        });
        this.myTeamSelected.emit({'contest': this.contest, 'source': source});
      }
    }
    else if (this.contest.state !== 'finished') {
      this.joinContest(teamId, source);
    }

  }

  ngOnInit() {
    this.setButtonText();
    this.initChart();
  }

  initChart() {
    if (!this.chart) {

      this.contest.dataSource.annotations.groups[0].items[0].fontSize = this.client.settings.charts.contest.size.teamNameFontSize;
      this.contest.dataSource.annotations.groups[0].items[1].fontSize = this.client.settings.charts.contest.size.teamNameFontSize;
      this.netChartHeight = 1 - (this.client.settings.charts.contest.size.topMarginPercent / 100);

      if (this.client.currentLanguage.direction === 'ltr') {
        this.teamsOrder = [0, 1];
      }
      else {
        this.teamsOrder = [1, 0];
      }

      this.adjustScores();
      window.FusionCharts.ready(() => {
        this.chart = new window.FusionCharts({
          type: this.client.settings.charts.contest.type,
          renderAt: this.id + '-container',
          width: this.client.chartWidth - WIDTH_MARGIN,
          height: this.client.chartHeight,
          dataFormat: 'json',
          dataSource: this.contest.dataSource,
          events: this.events
        });

        this.chart.render();

      });
    }
  }

  refresh(contest?:Contest) {
    if (contest) {
      //new contest object arrived
      this.contest = contest;
      this.setButtonText();
      this.adjustScores();
    }

    this.chart.setJSONData(this.contest.dataSource);
  }

  onResize() {
    this.chart.resizeTo(this.client.chartWidth - WIDTH_MARGIN, this.client.chartHeight);
  }

  adjustScores() {
    //Scores
    this.contest.dataSource.dataset[0].data[0].value = this.contest.teams[this.teamsOrder[0]].chartValue * this.netChartHeight;
    this.contest.dataSource.dataset[0].data[1].value = this.contest.teams[this.teamsOrder[1]].chartValue * this.netChartHeight;

    //Others (in grey)
    this.contest.dataSource.dataset[1].data[0].value = this.netChartHeight - this.contest.dataSource.dataset[0].data[0].value;
    this.contest.dataSource.dataset[1].data[1].value = this.netChartHeight - this.contest.dataSource.dataset[0].data[1].value;
  }

  setButtonText() {
    switch (this.contest.state) {
      case 'play':
        this.buttonText = this.client.translate('PLAY_FOR_TEAM', {'team': this.contest.teams[this.contest.myTeam].name});
        break;
      case 'join':
        this.buttonText = this.client.translate('PLAY_CONTEST');
        break;
      case 'finished':
        this.buttonText = this.finishedStateButtonText;
        break;
    }
  }

  joinContest(team, source, action:string = 'join') {

    contestsService.join(this.contest._id, team).then((data:any) => {

      this.refresh(data.contest);

      this.client.logEvent('contest/' + action, {
        'contestId': this.contest._id,
        'team': '' + this.contest.myTeam,
        'sourceClick': source
      });

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

      alertService.alert({
        'type': 'SELECT_TEAM_ALERT',
        'additionalInfo': {'team': this.contest.teams[this.contest.myTeam].name}
      }).then(() => {
        if (rankModal) {
          this.client.nav.present(rankModal);
        }
      });
    }, () => {
    });
  }

  switchTeams(source:string) {
    this.joinContest(1 - this.contest.myTeam, source, 'switchTeams');
  }

  onContestButtonClick() {
    if (this.contest.state === 'join') {
      alertService.alert({'type': 'SERVER_ERROR_NOT_JOINED_TO_CONTEST'});
    }
    else {
      this.contestButtonClick.emit({'contest': this.contest});
    }
  }
}
