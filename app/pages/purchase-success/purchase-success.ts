import {Page,NavParams} from 'ionic/ionic';
import {Client} from '../../providers/client';
import {SetContestPage} from '../../pages/set-contest/set-contest';

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
    FlurryAgent.logEvent('page/purchaseSuccess', {'feature' : this.params.data.featurePurchased});
    this.unlockText = this.client.translate(this.client.session.features[this.params.data.featurePurchased].unlockText);
  }

  proceed() {
    this.client.nav.popToRoot().then( () => {
      switch (this.client.session.features[this.params.data.featurePurchased].view.name) {
        case 'setContest':
          this.client.nav.push(SetContestPage, this.client.session.features[this.params.data.featurePurchased].view.params);
          break;
      }
    });
  }

}
