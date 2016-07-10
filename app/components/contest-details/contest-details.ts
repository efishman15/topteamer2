import {Component, Input, EventEmitter, Output} from '@angular/core';
import {Client} from '../../providers/client';
import {Contest} from '../../objects/objects';

@Component({
  selector: 'contest-details',
  templateUrl: 'build/components/contest-details/contest-details.html'
})

export class ContestDetailsComponent {

  @Input() contest:Contest;

  client:Client;
  @Output() contestSelected = new EventEmitter();

  constructor() {
    this.client = Client.getInstance();
  }

  onContestSelected() {
    this.contestSelected.emit({'contest': this.contest, 'source': 'contest-details'});
  }

  refresh(contest:Contest) {
    this.contest = contest;
  }

}
