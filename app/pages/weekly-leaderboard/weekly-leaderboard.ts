import {Page} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestLeadersComponent} from '../../components/contest-leaders/contest-leaders';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/weekly-leaderboard/weekly-leaderboard.html',
  directives: [ContestLeadersComponent]
})

export class WeeklyLeaderboardPage {

  client: Client;
  @ViewChild(ContestLeadersComponent) contestLeadersComponent : ContestLeadersComponent;

  constructor() {
    this.client = Client.getInstance();
  }

  onPageDidEnter() {
    this.contestLeadersComponent.showWeekly();
  }
}
