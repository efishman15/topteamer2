import {Page,NavParams} from 'ionic/ionic';
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/purchase-sucess/purchase-success.html'
})

export class PurchaseSuccessPage {

  client:Client;
  params:NavParams;
  unlockText:string;

  constructor(params:NavParams) {
    this.client = Client.getInstance();
    this.params = params;
  }

  onPageWillEnter() {
    this.unlockText = this.client.translate(client.session.features[this.params.data.featurePurchased].unlockText);
  }

  proceed() {
    this.client.nav.pop();
    if (!this.client.nav.canGoBack()) {
      //This is the root view - coming from paypal purchase over the web
      //TODO: navigate back to the app main page and from there dynamically to the "this.params.datanextView"
    }
  }

}
