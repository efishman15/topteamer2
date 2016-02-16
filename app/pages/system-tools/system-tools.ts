import {Page} from 'ionic/ionic';
import {Client} from '../../providers/client';
import * as alertService from '../../providers/alert';
import * as systemService from '../../providers/system';
import {PlayerInfoComponent} from '../../components/player-info/player-info';

@Page({
  templateUrl: 'build/pages/system-tools/system-tools.html',
  directives: [PlayerInfoComponent]
})

export class SystemToolsPage {

  client:Client;

  constructor() {
    this.client = Client.getInstance();
  }

  clearCache() {
    systemService.clearCache().then(() => {
      this.client.nav.pop();
    });
  }

  restart() {
    alertService.confirm('SYSTEM_RESTART_CONFIRM_TITLE', 'SYSTEM_RESTART_CONFIRM_TEMPLATE').then(() => {
      systemService.restart().then(() => {
        this.client.nav.pop();
      });
    });
  }
}
