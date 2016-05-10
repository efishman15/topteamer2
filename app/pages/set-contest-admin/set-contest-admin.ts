import {Page, NavParams, ViewController} from 'ionic-angular';
import {DatePickerComponent} from '../../components/date-picker/date-picker';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as alertService from '../../providers/alert';

@Page({
  templateUrl: 'build/pages/set-contest-admin/set-contest-admin.html',
  directives: [DatePickerComponent]
})

export class SetContestAdminPage {

  client:Client;
  params:NavParams;
  viewController: ViewController;

  showRemoveContest:Boolean;
  showStartDate:Boolean;

  constructor(params:NavParams, viewController: ViewController) {

    this.client = Client.getInstance();
    this.params = params;
    this.viewController = viewController;

    if (this.params.data.mode === 'edit') {

      if (this.params.data.contestLocalCopy.participants > 0) {
        this.showStartDate = false;
      }
      else {
        this.showStartDate = true;
      }
    }
    else if (this.params.data.mode === 'add') {
      //Create new local instance of a contest
      this.showStartDate = true;
    }

    this.showRemoveContest = (this.params.data.mode === 'edit' && this.client.session.isAdmin);

  }

  onPageWillEnter() {
    var eventData = {'mode': this.params.data.mode};
    if (this.params.data.mode === 'edit') {
      eventData['contestId'] = this.params.data.contestLocalCopy._id;
    }
    this.client.logEvent('page/setContestAdmin', eventData);
  }

  removeContest() {
    this.client.logEvent('contest/remove/click', {'contestId': this.params.data.contestLocalCopy._id});
    alertService.confirm('CONFIRM_REMOVE_TITLE', 'CONFIRM_REMOVE_TEMPLATE', {name: this.params.data.contestLocalCopy.name.long}).then(() => {
      this.client.logEvent('contest/removed', {'contestId': this.params.data.contestLocalCopy._id});
      contestsService.removeContest(this.params.data.contestLocalCopy._id).then(() => {
        this.client.events.publish('topTeamer:contestRemoved');
        setTimeout(() => {
          this.client.nav.popToRoot({animate: false});
        }, 1000);
      });
    });
  }

  dismiss(applyChanges: boolean) {
    this.client.logEvent('contest/setAdmin');
    this.viewController.dismiss(applyChanges);
  }

  //TODO: validate startDate<endDate
}
