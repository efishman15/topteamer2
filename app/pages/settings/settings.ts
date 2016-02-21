import {Page,NavParams} from 'ionic/ionic';
import {Client} from '../../providers/client';
import {LoginPage} from '../login/login';
import * as facebookService from '../../providers/facebook';

@Page({
  templateUrl: 'build/pages/settings/settings.html'
})

export class SettingsPage {

  client:Client;

  constructor() {
    this.client = Client.getInstance();
  }

  toggleSound() {
    this.client.toggleSound();
  }

  switchLanguage() {
    this.client.switchLanguage(this.client.currentLanguage.value).then(() => {
      this.client.session.settings.language = this.client.user.settings.language;
    });
  }

  logout() {
    facebookService.logout().then((response) => {
      this.client.logout();
      this.client.nav.pop().then(() => {
        this.client.nav.setRoot(LoginPage);
      });
    });
  }

}
