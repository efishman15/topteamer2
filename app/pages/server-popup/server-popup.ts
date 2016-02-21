import {Page,NavParams,ViewController} from 'ionic/ionic';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';

//Pages the server might want to redirect to
import {ContestPage} from '../contest/contest';
import {ContestParticipantsPage} from '../contest-participants/contest-participants';
import {LikePage} from '../like/like';
import {SetContestPage} from '../set-contest/set-contest';
import {SettingsPage} from '../settings/settings';

import * as shareService from '../../providers/share';

@Page({
  templateUrl: 'build/pages/server-popup/server-popup.html'
})
export class ServerPopupPage {

  client:Client;
  serverPopup:Object;
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
              shareService.share(contest);
            });
          });
        }
        else {
          this.viewController.dismiss(button).then(() => {
            shareService.share();
          });
        }
        break;
      }

      case 'screen' :
      {
        var screen;
        switch(button.screen) {
          case 'ContestPage':
            screen = ContestPage;
            break;
          case 'ContestParticipantsPage':
            screen = ContestParticipantsPage;
            break;
          case 'LikePage':
            screen = LikePage;
            break;
          case 'SetContestPage':
            screen = SetContestPage;
            break;
          case 'SettingsPage':
            screen = SettingsPage;
            break;
        }

        this.viewController.dismiss(button).then(() => {
          if (button.rootView) {
            this.client.nav.setRoot(screen,button.params);
          }
          else {
            this.client.nav.push(screen,button.params);
          }
        });

        break;
      }
    }
  }
}
