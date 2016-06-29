import {Component} from '@angular/core';
import {Client} from '../../providers/client';
import * as alertService from '../../providers/alert';
import * as systemService from '../../providers/system';

@Component({
  templateUrl: 'build/pages/system-tools/system-tools.html'
})

export class SystemToolsPage {

  client:Client;

  constructor() {
    this.client = Client.getInstance();
  }

  ionViewWillEnter() {
    this.client.logEvent('page/systemTools');
  }

  clearCache() {
    systemService.clearCache().then(() => {
      this.client.nav.pop();
    },() => {

    });
  }

  restart() {
    alertService.confirm('SYSTEM_RESTART_CONFIRM_TITLE', 'SYSTEM_RESTART_CONFIRM_TEMPLATE').then(() => {
      systemService.restart().then(() => {
        this.client.nav.pop();
      },() => {

      });
    }, () => {
      //Do nothing on cancel
    });
  }
}
