import {Client} from '../../providers/client';
import {Component} from "angular2/core";

@Component({
  selector: 'player-info',
  templateUrl: 'build/components/player-info/player-info.html'
})

export class PlayerInfoComponent {

  client: Client;

  constructor() {
    this.client = Client.getInstance();
  }
}
