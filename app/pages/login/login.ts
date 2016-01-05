import {IonicApp, Page, NavController} from 'ionic/ionic';
import {TabsPage} from '../tabs/tabs';
import {SignupPage} from '../signup/signup';
import {Server} from '../../providers/server';
import * as facebookService from '../../providers/facebook';

@Page({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {

  _server:Server;

  constructor(nav:NavController, app:IonicApp) {
    this.nav = nav;
    this.app = app;
    this._server = Server.getInstance();
  }

  get server() {
    return this._server;
  }

  login() {
    facebookService.login().then((response) => {
      this.nav.pop(LoginPage);
      this._server.facebookConnect(response.authResponse).then(() => {
        this.nav.push(TabsPage);
      })
    });
  };

  changeLanguage(language) {
    this._server.user.settings.language = language;
    localStorage.setItem('language', language);
  }

}
