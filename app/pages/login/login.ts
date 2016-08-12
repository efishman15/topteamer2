import {Component} from '@angular/core';
import {Client} from '../../providers/client';
import * as connectService from '../../providers/connect';
import * as analyticsService from '../../providers/analytics';
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
    analyticsService.track('page/login');
  }

  ionViewDidEnter() {
    //Events here could be serverPopup just as the app loads - the page should be fully visible
    this.client.processInternalEvents();
  }

  loginToServer(connectInfo:ConnectInfo) {
    return new Promise((resolve,reject)=> {
      this.client.serverConnect(connectInfo).then(() => {
        this.client.playerInfoComponent.init(this.client);
        this.client.setRootPage('MainTabsPage');
        resolve();
      }, () => {
        reject();
      })
    });
  }

  facebookLogin() {
    analyticsService.track('login/facebookLogin');
    connectService.facebookLogin().then((connectInfo:ConnectInfo) => {
      this.loginToServer(connectInfo).then(()=>{
        connectService.storeCredentials(connectInfo);
      });
    }, ()=> {
    });
  };

  registerGuest() {
    analyticsService.track('login/guest');
    connectService.guestLogin().then((connectInfo:ConnectInfo)=> {
      this.loginToServer(connectInfo).then(()=> {
      },()=>{
      });
    }, ()=> {
    });
  }

  changeLanguage(language) {
    this.client.user.settings.language = language;
    localStorage.setItem('language', language);
    analyticsService.track('login/changeLanguage', {language: language});
  }
}
