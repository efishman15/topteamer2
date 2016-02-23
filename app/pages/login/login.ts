import {Page,Modal} from 'ionic/ionic';
import {MainTabsPage} from '../main-tabs/main-tabs';
import {Client} from '../../providers/client';
import * as facebookService from '../../providers/facebook';
import {ServerPopupPage} from '../server-popup/server-popup';

@Page({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {

  client:Client;

  constructor() {
    this.client = Client.getInstance();

    this.client.events.subscribe('topTeamer:serverPopup', (eventData) => {
      var modal = Modal.create(ServerPopupPage, {'serverPopup': eventData[0]});
      this.client.nav.present(modal);
    });

  }

  onPageLoaded() {
    this.client.setPageTitle('GAME_NAME');
  }

  onPageWillEnter() {
    FlurryAgent.logEvent('page/login');
  }

  onPageDidEnter() {
    //Events here could be serverPopup just as the app loads - the page should be fully visible
    this.client.processInternalEvents();
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
