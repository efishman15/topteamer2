import {Client} from './client';
import * as facebookService from './facebook';
import {PurchaseSuccessPage} from '../pages/purchase-success/purchase-success'

//------------------------------------------------------
//-- buy
//------------------------------------------------------
export let buy = (feature:Object, isMobile:Boolean) => new Promise((resolve, reject) => {

  var client = Client.getInstance();

  var method;

  switch (client.user.clientInfo.platform) {
    case 'web' :
      var postData = {'feature': feature.name, 'language': client.session.settings.language};
      method = 'paypal';
      client.serverPost('payments/buy', postData).then((data) => {
          if (resolve) {
            resolve({'method': method, 'data': data});
          }
        }, (error) => {
          if (reject) {
            reject(error);
          }
        }
      );
      break;

    case 'android' :
      method = 'android';
      inappbilling.buy((purchaseData) => {
          if (resolve) {
            resolve({'method': method, 'data': purchaseData})
          }
        },
        (error) => {
          //Error messages will be displayed inside google
          if (reject) {
            reject(error);
          }
        },
        feature.purchaseData.productId);
      break;

    case 'ios' :
      method = 'ios';
      alert("TBD - purchase in ios");
      break;

    case 'facebook' :
      method = 'facebook';
      var productUrl = client.endPoint + 'facebook/product/' + feature.purchaseData.productId + '/' + client.session.settings.language;
      var facebookDialogData = {
        'method': 'pay',
        'action': 'purchaseitem',
        'product': productUrl,
        'request_id': feature.name + '|' + client.session.thirdParty.id + '|' + (new Date()).getTime()
      };
      if (isMobile && client.session.features[feature.name].purchaseData.mobilePricepointId) {
        facebookDialogData.pricepoint_id = client.session.features[feature.name].purchaseData.mobilePricepointId;
      }

      facebookService.buy(facebookDialogData).then((data) => {
        if (resolve) {
          resolve({'method': method, 'data': data})
        }
      }, (error) => {
        if (reject) {
          reject(error);
        }
      });
      break;
  }

});

//------------------------------------------------------
//-- showPurchaseSuccess
//------------------------------------------------------
export let showPurchaseSuccess = (serverPurchaseData) => {

  var client = Client.getInstance();

  client.session.features = serverPurchaseData.features
  client.nav.push(PurchaseSuccessPage, {'featurePurchased' : serverPurchaseData.featurePurchased});
};

//------------------------------------------------------
//-- processPayment
//------------------------------------------------------
export let processPayment = (method, purchaseData, extraPurchaseData) => new Promise((resolve, reject) => {

  var client = Client.getInstance();

  var postData = {'method': method, 'purchaseData': purchaseData};
  if (extraPurchaseData) {
    postData.extraPurchaseData = extraPurchaseData;
  }

  client.serverPost('payments/process', postData).then((serverPuchaseData) => {
    if (resolve) {
      resolve(serverPuchaseData);
    }
  }, (error) => {
    if (reject) {
      reject(error);
    }
  })
});

