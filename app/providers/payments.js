var client_1 = require('./client');
var facebookService = require('./facebook');
var purchase_success_1 = require('../pages/purchase-success/purchase-success');
//------------------------------------------------------
//-- buy
//------------------------------------------------------
exports.buy = function (feature, isMobile) { return new Promise(function (resolve, reject) {
    var client = client_1.Client.getInstance();
    var method;
    switch (client.user.clientInfo.platform) {
        case 'web':
            var postData = { 'feature': feature.name, 'language': client.session.settings.language };
            method = 'paypal';
            client.serverPost('payments/buy', postData).then(function (data) {
                if (resolve) {
                    resolve({ 'method': method, 'data': data });
                }
            }, function (error) {
                if (reject) {
                    reject(error);
                }
            });
            break;
        case 'android':
            method = 'android';
            inappbilling.buy(function (purchaseData) {
                if (resolve) {
                    resolve({ 'method': method, 'data': purchaseData });
                }
            }, function (error) {
                //Error messages will be displayed inside google
                if (reject) {
                    reject(error);
                }
            }, feature.purchaseData.productId);
            break;
        case 'ios':
            method = 'ios';
            alert("TBD - purchase in ios");
            break;
        case 'facebook':
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
            facebookService.buy(facebookDialogData).then(function (data) {
                if (resolve) {
                    resolve({ 'method': method, 'data': data });
                }
            }, function (error) {
                if (reject) {
                    reject(error);
                }
            });
            break;
    }
}); };
//------------------------------------------------------
//-- showPurchaseSuccess
//------------------------------------------------------
exports.showPurchaseSuccess = function (serverPurchaseData) {
    var client = client_1.Client.getInstance();
    client.session.features = serverPurchaseData.features;
    client.nav.push(purchase_success_1.PurchaseSuccessPage, { 'featurePurchased': serverPurchaseData.featurePurchased });
};
//------------------------------------------------------
//-- processPayment
//------------------------------------------------------
exports.processPayment = function (method, purchaseData, extraPurchaseData) { return new Promise(function (resolve, reject) {
    var client = client_1.Client.getInstance();
    var postData = { 'method': method, 'purchaseData': purchaseData };
    if (extraPurchaseData) {
        postData.extraPurchaseData = extraPurchaseData;
    }
    client.serverPost('payments/process', postData).then(function (serverPuchaseData) {
        if (resolve) {
            resolve(serverPuchaseData);
        }
    }, function (error) {
        if (reject) {
            reject(error);
        }
    });
}); };
