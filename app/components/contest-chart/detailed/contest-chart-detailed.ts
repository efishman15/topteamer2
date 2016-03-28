import {Component} from 'angular2/core';
import {ContestChartBaseComponent} from '../base/contest-chart-base';

@Component({
  selector: 'contest-chart-detailed',
  templateUrl: 'build/components/contest-chart/detailed/contest-chart-detailed.html',
  directives: [ContestChartBaseComponent]
})

export class ContestChartDetailedComponent extends ContestChartBaseComponent {
  playText: string;

  ngOnInit() {
    switch (this.contest.state) {
      case 'play':
            this.playText = this.client.translate('PLAY_FOR_TEAM',{'team': this.contest.teams[this.contest.myTeam].name});
            break;
      case 'join':
        this.playText = this.client.translate('PLAY_CONTEST');
        break;
    }
  }
}
