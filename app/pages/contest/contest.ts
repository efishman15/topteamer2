import {IonicApp, Page, Component, NavParams} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestChartComponent} from '../../components/contest-chart/contest-chart';
import {Server} from '../../providers/server';
import * as contestsService from '../../providers/contests';


@Page({
  templateUrl: 'build/pages/contest/contest.html',
  directives: [ContestChartComponent]
})

export class ContestPage {

  server:Server;
  app:IonicApp;
  params:NavParams;
  contestChart:Object = {};

  constructor(app:IonicApp, params:NavParams) {
    this.app = app;
    this.params = params;
    this.server = Server.getInstance();
  }

  onPageWillEnter() {
    this.app.setTitle(this.server.translate('WHO_SMARTER_QUESTION'));

    var contestId;
    if (this.params.data.contest) {
      contestId = this.params.data.contest._id;
    }
    else {
      contestId = this.params.data.contestId;
    }

    var postData = {'contestId': contestId};
    this.server.post('contests/get', postData).then((contest) => {
      this.contestChart = contestsService.prepareContestChart(contest, "starts");
      console.log("this.contestChart=" + JSON.stringify(this.contestChart));
    });

  }
}
