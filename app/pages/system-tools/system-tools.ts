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
    systemService.clearCache().then((settings) => {
      this.client.settings = settings;
      this.client.nav.pop();
    },() => {
    });
  }

  restart() {
    alertService.confirm('SYSTEM_RESTART_CONFIRM_TITLE', 'SYSTEM_RESTART_CONFIRM_TEMPLATE').then(() => {
      systemService.restart().then(() => {
        //Ionic bug - let the confirm dialog properly close
        setTimeout(() => {
          this.client.nav.pop();
        },500)
      },() => {
      });
    }, () => {
      //Do nothing on cancel
    });
  }

  showLog() {
    window.open(this.client.endPoint + 'system/log/' + this.client.session['token']);
  }

}
