import {Client} from './client';

//------------------------------------------------------
//-- alert
//------------------------------------------------------
export let alert = (error) => {

  var client = Client.getInstance();

  if (error) {
    if (error.type) {
      if (!error.additionalInfo) {
        error.additionalInfo = {};
      }

      return client.popup.alert(
      {
        'cssClass': client.currentLanguage.direction,
        'title': client.translate(error.type + '_TITLE'),
        'template': client.translate(error.type + '_MESSAGE', error.additionalInfo),
        'okText': client.translate('OK')
      });
    }
    else {
      return client.popup.alert({
        'cssClass': client.currentLanguage.direction,
        'template': error,
        'okText': client.translate('OK')
      });
    }
  }
};

//------------------------------------------------------
//-- confirm
//------------------------------------------------------
export let confirm = (title, message, params) => {

  var client = Client.getInstance();

  return client.popup.confirm({
    title: client.translate(title, params),
    template: client.translate(message, params),
    cssClass: client.currentLanguage.direction,
    'okText': client.translate('OK'),
    'cancelText': client.translate('CANCEL')
  });
}

//------------------------------------------------------
//-- confirmExitApp
//------------------------------------------------------
export let confirmExitApp = () => {

  var client = Client.getInstance();

  return this.confirm('EXIT_APP_TITLE', 'EXIT_APP_MESSAGE', null).then ( () => {
    FlurryAgent.endSession();
    client.platform.exitApp();
  })
};
