import {Page} from 'ionic/ionic';
import {Client} from '../../providers/client';
import * as systemService from '../../providers/system';

@Page({
  templateUrl: 'build/pages/system-tools/system-tools.html'
})

export class SystemToolsPage {

  client:Client;

  constructor() {
    this.client = Client.getInstance();
  }

  clearCache() {
    systemService.clearCache().then( () => {
      this.client.nav.pop();
    });
  }

  restart() {
    systemService.restart().then (() => {
      this.client.nav.pop();
    });
  }

}
