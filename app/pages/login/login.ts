import {Component} from '@angular/core';
import {Client} from '../../providers/client';
import * as connectService from '../../providers/connect';
import {ConnectInfo} from '../../objects/objects';

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
    connectService.login().then((connectInfo:ConnectInfo) => {
      this.client.serverConnect(connectInfo).then(() => {
        this.client.playerInfoComponent.init(this.client);
        this.client.setRootPage('MainTabsPage');
      }, () => {
      })
    }, ()=> {
    });

  }

  facebookLogin() {
    this.client.logEvent('login/facebookLogin');
    this.login();
  };

  registerGuest() {
    this.client.logEvent('login/guest');
    connectService.createGuest();
    this.login();
  }

  changeLanguage(language) {
    this.client.user.settings.language = language;
    localStorage.setItem('language', language);
    this.client.logEvent('login/changeLanguage', {language: language});
  }
}
