import {Page,NavParams} from 'ionic/ionic';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/settings/settings.html'
})

export class SettingsPage {

  client:Client;

  constructor() {
    this.client = Client.getInstance();
  }

  toggleSound() {
    this.client.toggleSound();
  }

  switchLanguage() {
    this.client.switchLanguage(this.client.currentLanguage.value).then(() => {
      this.client.session.settings.language = this.client.user.settings.language;
    });
  }

}
