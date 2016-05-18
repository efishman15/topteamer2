import {Client} from './client';
import {Alert, ActionSheet} from 'ionic-angular';

//------------------------------------------------------
//-- alert
//------------------------------------------------------
export let alert = (message) => new Promise((resolve, reject) => {

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
    cssClass: client.currentLanguage.direction,
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
