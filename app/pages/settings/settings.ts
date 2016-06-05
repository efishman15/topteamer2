import {Page} from 'ionic-angular';
import {Client} from '../../providers/client';
import * as facebookService from '../../providers/facebook';

@Page({
  templateUrl: 'build/pages/settings/settings.html'
})

export class SettingsPage {

  client:Client;
  originalLanguage: string;

  constructor() {
    this.client = Client.getInstance();
  }

  onPageWillEnter() {
    this.client.logEvent('page/settings');
    this.originalLanguage = this.client.session.settings.language;
  }

  onPageDidLeave() {
    if (this.client.session.settings.language != this.originalLanguage) {
      this.client.events.publish('topTeamer:languageChanged');
    }
  }

  toggleSound() {
    this.client.logEvent('settings/sound/' + !this.client.session.settings.sound);
    this.client.toggleSound();
  }

  switchLanguage() {
    this.client.switchLanguage(this.client.currentLanguage.value).then(() => {
      this.client.session.settings.language = this.client.user.settings.language;
      this.client.logEvent('settings/language/change', {language: this.client.user.settings.language});
    });
  }

  logout() {
    this.client.logEvent('settings/facebookSignOut');
    facebookService.logout().then((response) => {
      this.client.logout();
      this.client.nav.pop().then(() => {
        this.client.setRootPage('LoginPage');
      });
    });
  }

}
