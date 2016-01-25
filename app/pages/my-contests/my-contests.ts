import {IonicApp, Page, Component,NavController} from 'ionic/ionic';
import {ViewChild} from 'angular2/core';
import {ContestListComponent} from '../../components/contest-list/contest-list';
import {Client} from '../../providers/client';
import {ContestPage} from '../contest/contest'
import * as contestsService from '../../providers/contests';
import {DatePickerComponent} from '../../components/date-picker/date-picker';
import {ItemSelectionComponent} from '../../components/item-selection/item-selection';

@Page({
  templateUrl: 'build/pages/my-contests/my-contests.html',
  directives: [ContestListComponent, DatePickerComponent,ItemSelectionComponent]
})

export class MyContestsPage {

  @ViewChild(ContestListComponent) contestList: ContestListComponent;
  client: Client;

  currentLanguage:string;
  languages:Array<Object>;

  constructor() {
    this.client = Client.getInstance();

    this.currentLanguage = "en";
    this.languages = [
      {'value' : 'en', 'displayValue': 'English'},
      {'value' : 'es', 'displayValue': 'Spanish'},
      {'value' : 'he', 'displayValue': 'Hebrew'},
    ]
  }

  onPageWillEnter() {
    if (this.contestList) {
      this.contestList.refresh();
    }
  }

  onPageDidEnter() {
  }

  ngAfterViewInit() {
    this.contestList.refresh();
  }

  onContestSelected(data) {
    contestsService.openContest(data.contest._id);
  }

  dateSelected(theDate) {
    console.log("date selected: " + theDate);
  }
}
