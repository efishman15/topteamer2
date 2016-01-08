import {IonicApp, Page, NavController} from 'ionic/ionic';
import {TabsPage} from '../tabs/tabs';
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

  login() {
    facebookService.login().then((response) => {
      this.client.nav.pop(LoginPage);
      this.client.facebookServerConnect(response.authResponse).then(() => {
        this.client.nav.push(TabsPage);
      })
    });
  };

  changeLanguage(language) {
    this.client.user.settings.language = language;
    localStorage.setItem('language', language);
  }

}
