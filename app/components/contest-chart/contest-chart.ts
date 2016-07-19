import {Component, Input, EventEmitter, Output} from '@angular/core';
import {Modal} from 'ionic-angular';
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
  @Input() alternateButtonText:string;

  chartTeamEventHandled:boolean;
  client:Client;
  chart:any;
  netChartHeight:number;
  teamsOrder:Array<number>;

  @Output() contestSelected = new EventEmitter();
  @Output() myTeamSelected = new EventEmitter();
  @Output() contestButtonClick = new EventEmitter();
  @Output() joinedContest = new EventEmitter();

  events:Object = {
    'dataplotClick': (eventObj, dataObj) => {
      var teamId = dataObj.dataIndex;
      if (this.client.currentLanguage.direction === 'rtl') {
        teamId = 1 - teamId;
      }
      this.teamSelected(teamId, 'teamBar');
      this.chartTeamEventHandled = true;
    },
    'dataLabelClick': (eventObj, dataObj) => {
      var teamId = dataObj.dataIndex;
      if (this.client.currentLanguage.direction === 'rtl') {
        teamId = 1 - teamId;
      }
      this.teamSelected(teamId, 'teamPercent');
      this.chartTeamEventHandled = true;
    },
    'annotationClick': (eventObj, dataObj) => {
      var teamId;
      if (dataObj.annotationOptions.text === this.contest.teams[0].name) {
        teamId = 0;
      }
      else {
        teamId = 1;
      }
      this.teamSelected(teamId, 'teamName');
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
    this.contestSelected.emit({'contest': this.contest, 'source': source});
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
      this.joinContest(teamId, source, false, true,false).then(()=> {
      }, ()=> {
      });
    }

  }

  ngOnInit() {
    this.initChart();
  }

  initChart() {
    if (!this.chart) {

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

  joinContest(team:number, source:string, switchTeams:boolean, showAlert:boolean, delayRankModal:boolean) {

    return new Promise((resolve:any, reject:any) => {

      contestsService.join(this.contest._id, team).then((data:any) => {

        this.refresh(data.contest);

        this.joinedContest.emit({'contest': data.contest});

        this.client.logEvent('contest/' + (!switchTeams ? 'join' : 'switchTeams'), {
          'contestId': this.contest._id,
          'team': '' + this.contest.myTeam,
          'sourceClick': source
        });

        //Should get xp if fresh join
        var rankModal;
        if (data.xpProgress && data.xpProgress.addition > 0) {
          //Adds the xp with animation
          if (data.xpProgress.rankChanged) {
            rankModal = this.client.createModalPage('NewRankPage', {
              'xpProgress': data.xpProgress
            });
            if (!delayRankModal) {
              rankModal.onDismiss(()=> {
                resolve();
              });
            }
            else {
              resolve(rankModal);
            }
            this.client.addXp(data.xpProgress).then(() => {
            }, () => {
              reject();
            })
          }
        }

        if (showAlert) {
          alertService.alert({
            'type': 'SELECT_TEAM_ALERT',
            'additionalInfo': {'team': this.contest.teams[this.contest.myTeam].name}
          }).then(() => {
            if (rankModal && !delayRankModal) {
              this.client.nav.present(rankModal);
            }
            else {
              resolve(rankModal);
            }
          });
        }
        else {
          if (rankModal && !delayRankModal) {
            //resolve will be called upon dismiss
            this.client.nav.present(rankModal);
          }
          else {
            resolve(rankModal);
          }
        }
      }, () => {
        reject();
      })
    });
  }

  switchTeams(source:string) {
    this.joinContest(1 - this.contest.myTeam, source, true, true, false).then(()=> {
    }, ()=> {
    });
  }

  onContestButtonClick() {
    if (this.contest.state === 'join') {
      //Will prompt an alert with 2 buttons with the team names
      //Upon selecting a team - send the user directly to play
      let cssClass:string;
      if (this.contest.teams[0].name.length + this.contest.teams[1].name.length > this.client.settings.contest.maxTeamsLengthForLargeFonts) {
        cssClass = 'chart-popup-button-team-small';
      }
      else {
        cssClass = 'chart-popup-button-team-normal';
      }
      alertService.alert({'type': 'PLAY_CONTEST_CHOOSE_TEAM'}, [
        {
          'text': this.contest.teams[0].name,
          'cssClass': cssClass + '-' + this.teamsOrder[0],
          'handler': () => {
            this.joinContest(0, 'button', false, false, true).then((rankModal:Modal) => {
              this.contestButtonClick.emit({'contest': this.contest, 'source': 'button'});
              if (rankModal) {
                this.client.nav.present(rankModal);
              }
            }, ()=> {
            });
          }
        },
        {
          'text': this.contest.teams[1].name,
          'cssClass': cssClass + '-' + this.teamsOrder[1],
          'handler': () => {
            this.joinContest(1, 'button', false, false, true).then((rankModal:Modal) => {
              this.contestButtonClick.emit({'contest': this.contest, 'source': 'button'});
              if (rankModal) {
                this.client.nav.present(rankModal);
              }
            }, ()=> {
            });
          }
        },
      ]);
    }
    else {
      this.contestButtonClick.emit({'contest': this.contest, 'source': 'button'});
    }
  }
}
