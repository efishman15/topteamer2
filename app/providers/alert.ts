import {Client} from './client';
import {Alert, ActionSheet} from 'ionic/ionic';

//------------------------------------------------------
//-- alert
//------------------------------------------------------
export let alert = (error) => {

  var client = Client.getInstance();

  var alert:Alert;
  if (error) {
    if (error.type) {
      if (!error.additionalInfo) {
        error.additionalInfo = {};
      }

      alert = Alert.create(
        {
          'cssClass': client.currentLanguage.direction,
          'title': client.translate(error.type + '_TITLE'),
          'message': client.translate(error.type + '_MESSAGE', error.additionalInfo),
          'buttons': [client.translate('OK')]
        });
    }
    else {
      alert = Alert.create({
        'cssClass': client.currentLanguage.direction,
        'message': error,
        'buttons': [client.translate('OK')]
      });
    }

    client.nav.present(alert);
  }
};

//------------------------------------------------------
//-- confirm
//------------------------------------------------------
export let confirm = (title, message, params) => {

  return new Promise((resolve, reject) => {

    var client = Client.getInstance();

    var alert = Alert.create({
      title: client.translate(title, params),
      message: client.translate(message, params),
      cssClass: client.currentLanguage.direction,
      buttons: [
        {
          text: client.translage('OK'),
          handler: resolve
        },
        {
          text: client.translage('CANCEL'),
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
    FlurryAgent.endSession();
    client.platform.exitApp();
  })
};
