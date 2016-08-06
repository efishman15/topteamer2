import {Component, Input, EventEmitter, Output} from '@angular/core';
import {Modal} from 'ionic-angular';
import {Client} from '../../providers/client';
import * as alertService from '../../providers/alert';
import * as contestsService from '../../providers/contests';
import {Contest} from '../../objects/objects';

@Component({
  selector: 'contest-chart',
  templateUrl: 'build/components/contest-chart/contest-chart.html'
})

export class ContestChartComponent {

  @Input() contest:Contest;
  @Input() alternateButtonText:string;

  client:Client;

  @Output() contestSelected = new EventEmitter();
  @Output() myTeamSelected = new EventEmitter();
  @Output() contestButtonClick = new EventEmitter();
  @Output() joinedContest = new EventEmitter();

  animation:string;
  eventJustHandled: boolean;

  constructor() {
    this.client = Client.getInstance();
    this.animation = null;
    this.eventJustHandled = false;
  }

  onContestSelected(event:Event, source:string) {
    if (this.eventJustHandled) {
      this.eventJustHandled = false;
      return;
    }
    if (source !== 'chart') {
      this.eventJustHandled = true;
    }
    this.contestSelected.emit({'contest': this.contest, 'source': source});
  }

  teamSelected(event:Event, teamId:number, source:string) {
    this.eventJustHandled = true;
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
      this.joinContest(teamId, source, false, true, false).then(()=> {
      }, ()=> {
      });
    }

  }

  refresh(contest?:Contest, animation?:string) {
    this.contest = contest;
    this.animation = animation;
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

        //Notify outside that contest changed
        this.client.events.publish('topTeamer:contestUpdated', data.contest, data.contest.status, data.contest.status);

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
            this.client.playerInfoComponent.addXp(data.xpProgress).then(() => {
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
          },()=> {
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

  onContestButtonClick(event:Event) {
    this.eventJustHandled = true;
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
          'cssClass': cssClass + '-0',
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
          'cssClass': cssClass + '-1',
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
