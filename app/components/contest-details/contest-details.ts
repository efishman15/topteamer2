import {Component, Input, EventEmitter, Output} from '@angular/core';
import {Client} from '../../providers/client';
import {Contest} from '../../objects/objects';

@Component({
  selector: 'contest-details',
  templateUrl: 'build/components/contest-details/contest-details.html'
})

export class ContestDetailsComponent {

  @Input() id:Number;
  @Input() contest:Contest;
  width: number;

  client:Client;
  @Output() contestSelected = new EventEmitter();

  constructor() {
    this.client = Client.getInstance();
  }

  ngOnInit() {
    this.width = this.client.width * this.client.settings.charts.contest.size.widthRatio;
  }

  onContestSelected() {
    this.contestSelected.emit({'contest': this.contest, 'source': 'contest-details'});
  }

  refresh(contest: Contest) {
    this.contest = contest;
  }

  onResize() {
    var newWidth = this.client.width * this.client.settings.charts.contest.size.widthRatio;
    if (this.width !== newWidth) {
      this.width = newWidth;
    }
  }
}
