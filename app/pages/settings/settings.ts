import {Page,NavParams} from 'ionic/ionic';
import {Client} from '../../providers/client';
import {LoginPage} from '../login/login';
import * as facebookService from '../../providers/facebook';
import {PlayerInfoComponent} from '../../components/player-info/player-info';

@Page({
  templateUrl: 'build/pages/settings/settings.html',
  directives: [PlayerInfoComponent]
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
      this.client.nav.pop().then(() => {
        this.client.nav.setRoot(LoginPage);
      });
    });
  }

}
