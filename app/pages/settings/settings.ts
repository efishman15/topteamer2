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
    this.client.toggleSound().then(() => {
      this.client.session.settings.sound = !this.client.session.settings.sound;
    });
  }

  switchLanguage() {
    this.client.switchLanguage(this.client.currentLanguage.value).then(() => {
      this.client.session.settings.language = this.client.currentLanguage.value;
    });
  }

}
