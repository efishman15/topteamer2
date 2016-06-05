import {Page} from 'ionic-angular';
import {Client} from '../../providers/client';
import * as facebookService from '../../providers/facebook';

@Page({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {

  client:Client;

  constructor() {
    this.client = Client.getInstance();

    this.client.events.subscribe('topTeamer:serverPopup', (eventData) => {
      this.client.showModalPage('ServerPopupPage', {'serverPopup': eventData[0]});
    });

  }

  onPageLoaded() {
    this.client.setPageTitle('GAME_NAME');
  }

  onPageWillEnter() {
    this.client.logEvent('page/login');
  }

  onPageDidEnter() {
    //Events here could be serverPopup just as the app loads - the page should be fully visible
    this.client.processInternalEvents();
  }

  login() {
    this.client.logEvent('login/facebookLogin');
    facebookService.login().then((response) => {
      this.client.facebookServerConnect(response['authResponse']).then(() => {
        this.client.setRootPage('MainTabsPage');
      })
    });
  };

  changeLanguage(language) {
    this.client.user.settings.language = language;
    localStorage.setItem('language', language);
    this.client.logEvent('login/changeLanguage', {language: language});
  }

}
