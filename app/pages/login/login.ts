import {Page} from 'ionic/ionic';
import {MainTabsPage} from '../main-tabs/main-tabs';
import {Client} from '../../providers/client';
import * as facebookService from '../../providers/facebook';

@Page({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {

  client:Client;

  constructor() {
    this.client = Client.getInstance();
  }

  onPageLoaded() {
    this.client.setPageTitle('GAME_NAME');
  }

  login() {
    facebookService.login().then((response) => {
      this.client.nav.pop(LoginPage);
      this.client.facebookServerConnect(response.authResponse).then(() => {
        this.client.nav.push(MainTabsPage);
      })
    });
  };

  changeLanguage(language) {
    this.client.user.settings.language = language;
    localStorage.setItem('language', language);
  }

}
