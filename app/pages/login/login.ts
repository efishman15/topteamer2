import {Component} from '@angular/core';
import {Client} from '../../providers/client';
import * as facebookService from '../../providers/facebook';

@Component({
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

  ngOnInit() {
    this.client.hidePreloader();
  }

  ionViewLoaded() {
    this.client.setPageTitle('GAME_NAME');
  }

  ionViewWillEnter() {
    this.client.logEvent('page/login');
  }

  ionViewDidEnter() {
    //Events here could be serverPopup just as the app loads - the page should be fully visible
    this.client.processInternalEvents();
  }

  login() {
    this.client.logEvent('login/facebookLogin');
    facebookService.login().then((response) => {
      this.client.facebookServerConnect(response['authResponse']).then(() => {
        this.client.setRootPage('MainTabsPage');
      }, () => {
      })
    }, ()=> {
    });
  };

  changeLanguage(language) {
    this.client.user.settings.language = language;
    localStorage.setItem('language', language);
    this.client.logEvent('login/changeLanguage', {language: language});
  }

}
