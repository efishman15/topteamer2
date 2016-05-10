import {Component, Input, Output, EventEmitter, ViewChildren, QueryList} from 'angular2/core';
import {ContestChartComponent} from '../contest-chart/contest-chart';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import {Contest} from "../../objects/objects";

@Component({
  selector: 'contest-list',
  templateUrl: 'build/components/contest-list/contest-list.html',
  directives: [ContestChartComponent],
})

export class ContestListComponent {
  @Input() tab:String;
  @Output() contestSelected = new EventEmitter();

  @ViewChildren(ContestChartComponent) contestChartComponents:QueryList<ContestChartComponent>;

  contests:Array<Contest>;
  client:Client;

  constructor() {
    this.client = Client.getInstance();
  }

  refresh() {
    return new Promise( (resolve, reject) => {
      contestsService.list(this.tab).then((contests) => {
        this.contests = contests;
        resolve();
      }), () => {
        reject();
      };
    });
  }

  onContestSelected(data) {
    this.contestSelected.emit(data);
  }

  onResize() {
    if (this.contestChartComponents && this.contestChartComponents.length > 0) {
      this.contestChartComponents.forEach( (contestChartComponent: ContestChartComponent) => {
        contestChartComponent.onResize();
      });
    }
  }
}


