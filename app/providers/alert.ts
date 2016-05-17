import {Client} from './client';
import {Alert, ActionSheet} from 'ionic-angular';

//------------------------------------------------------
//-- alert
//------------------------------------------------------
export let alert = (error) => new Promise((resolve, reject) => {

  var client = Client.getInstance();

  var alert:Alert;
  var title;
  var message;

  if (error.type) {
    if (!error.additionalInfo) {
      error.additionalInfo = {};
    }

    title = client.translate(error.type + '_TITLE');
    message = client.translate(error.type + '_MESSAGE', error.additionalInfo);

  }
  else {
    message = error;
  }

  alert = Alert.create({
    cssClass: client.currentLanguage.direction,
    message: message,
    buttons: [
      {
        text: client.translate('OK'),
        role: 'cancel',
        handler: resolve
      }
    ]
  });

  if (title) {
    alert.setTitle(title);
  }

  client.nav.present(alert);

});

//------------------------------------------------------
//-- confirm
//------------------------------------------------------
export let confirm = (title, message, params?) => new Promise((resolve, reject) => {

  var client = Client.getInstance();

  var alert = Alert.create({
    title: client.translate(title, params),
    message: client.translate(message, params),
    cssClass: client.currentLanguage.direction,
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
