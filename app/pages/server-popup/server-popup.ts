import {Page,NavParams,ViewController} from 'ionic-angular';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as shareService from '../../providers/share';
import {ServerPopup} from '../../objects/objects';

@Page({
  templateUrl: 'build/pages/server-popup/server-popup.html'
})
export class ServerPopupPage {

  client:Client;
  serverPopup:ServerPopup;
  viewController:ViewController;

  constructor(params:NavParams, viewController: ViewController) {

    this.client = Client.getInstance();
    this.serverPopup = params.data.serverPopup;

    //Look for special variables such as #storeLink (based on client's platform
    for (var i=0; i<this.serverPopup.buttons.length; i++) {
      if (this.serverPopup.buttons[i].link && this.serverPopup.buttons[i].link.indexOf('#storeLink') >= 0) {
        this.serverPopup.buttons[i].link = this.serverPopup.buttons[i].link.replaceAll('#storeLink',this.client.settings.platforms[this.client.clientInfo.platform].storeLink);
      }
    }

    this.viewController = viewController;
  }

  onPageWillEnter() {
    this.client.logEvent('page/serverPopup', {'title' : this.serverPopup.title, 'message' : this.serverPopup.message});
  }

  buttonAction(button) {
    switch (button.action) {
      case 'dismiss' :
        this.viewController.dismiss(button);
        break;

      case 'link' :
      {
        window.open(button.link, '_system', 'location=yes');
        this.viewController.dismiss(button);
        break;
      }

      case 'linkExit' :
      {
        window.open(button.link, '_system', 'location=yes');
        setTimeout(() => {
          this.client.platform.exitApp();
        }, 1000)
        break;
      }

      case 'share' :
      {
        if (button.contestId) {
          contestsService.getContest(button.contestId).then ((contest) => {
            this.viewController.dismiss(button).then(() => {
              shareService.share('serverPopup',contest);
            });
          });
        }
        else {
          this.viewController.dismiss(button).then(() => {
            shareService.share('serverPopup');
          });
        }
        break;
      }

      case 'screen' :
      {
        this.viewController.dismiss(button).then(() => {
          if (button.rootView) {
            this.client.setRootPage(button.screen, button.params)
          }
          else {
            this.client.openPage(button.screen, button.params)
          }
        });

        break;
      }
    }
  }
}
