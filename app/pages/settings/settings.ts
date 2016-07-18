import {Component} from '@angular/core';
import {Client} from '../../providers/client';
import * as facebookService from '../../providers/facebook';

@Component({
  templateUrl: 'build/pages/settings/settings.html'
})

export class SettingsPage {

  client:Client;
  originalLanguage:string;

  constructor() {
    this.client = Client.getInstance();
  }

  ionViewWillEnter() {
    this.client.logEvent('page/settings');
    this.originalLanguage = this.client.session.settings.language;
  }

  ionViewDidLeave() {
    if (this.client.session.settings.language != this.originalLanguage) {
      let directionChanged : boolean = false;
      if (this.client.settings.languages[this.client.session.settings.language].direction !== this.client.settings.languages[this.originalLanguage].direction) {
        directionChanged = true;
      }
      this.client.events.publish('topTeamer:languageChanged', directionChanged);
    }
  }

  toggleSound() {
    this.client.logEvent('settings/sound/' + !this.client.session.settings.sound);
    this.client.toggleSound().then(() => {
    }, (err) => {
      //Revert GUI on server error
      this.client.session.settings.sound = !this.client.session.settings.sound;
    });
  }

  switchLanguage() {
    this.client.switchLanguage().then(()=> {
    }, () => {
    });
  }

  logout() {
    this.client.logEvent('settings/facebookSignOut');
    facebookService.logout().then((response) => {
      this.client.logout();
      this.client.setRootPage('LoginPage');
    });
  }

}
