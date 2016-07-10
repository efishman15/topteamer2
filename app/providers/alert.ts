import {Client} from './client';
import {Alert, ActionSheet} from 'ionic-angular';

//------------------------------------------------------
//-- alert
//------------------------------------------------------
export let alert = (message) => {

  return new Promise((resolve, reject) => {

    var client = Client.getInstance();

    var alert:Alert;
    var title;
    var messageText;

    if (message.type) {
      if (!message.additionalInfo) {
        message.additionalInfo = {};
      }

      title = client.translate(message.type + '_TITLE');
      messageText = client.translate(message.type + '_MESSAGE', message.additionalInfo);

    }
    else {
      messageText = message;
    }

    alert = Alert.create({
      message: messageText,
      buttons: [
        {
          text: client.translate('OK'),
          role: 'cancel',
          handler: resolve
        }
      ]
    });

    if (title) {
      alert.setTitle('<span class="app-alert-title-' + client.currentLanguage.direction + '">' + title + '</span>');
    }

    client.nav.present(alert);

  });
}

//------------------------------------------------------
//-- confirm
//------------------------------------------------------
export let confirm = (title, message, params?) => {

  return new Promise((resolve, reject) => {

    var client = Client.getInstance();
    var alignedTitle = '<span class="app-alert-title-' + client.currentLanguage.direction + '">' + client.translate(title, params) + '</span>';

    var alert = Alert.create({
      title: alignedTitle,
      message: client.translate(message, params),
      buttons: [
        {
          text: client.translate('OK'),
          handler: resolve
        },
        {
          text: client.translate('CANCEL'),
          handler: reject
        }
      ]
    });

    client.nav.present(alert);

  });
}


//------------------------------------------------------
//-- confirmExitApp
//------------------------------------------------------
export let confirmExitApp = () => {

  var client = Client.getInstance();

  return this.confirm('EXIT_APP_TITLE', 'EXIT_APP_MESSAGE', null).then(() => {
    window.FlurryAgent.endSession();
    window.navigator['app'].exitApp();
  })
};
