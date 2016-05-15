import {Page, NavParams, ViewController} from 'ionic-angular';
import {DatePickerComponent} from '../../components/date-picker/date-picker';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as alertService from '../../providers/alert';
import {CalendarCell} from '../../objects/objects';

@Page({
  templateUrl: 'build/pages/set-contest-admin/set-contest-admin.html',
  directives: [DatePickerComponent]
})

export class SetContestAdminPage {

  client:Client;
  params:NavParams;
  viewController: ViewController;

  showRemoveContest:Boolean;

  constructor(params:NavParams, viewController: ViewController) {

    this.client = Client.getInstance();
    this.params = params;
    this.viewController = viewController;

    this.showRemoveContest = (this.params.data.mode === 'edit' && this.client.session.isAdmin);

  }

  onPageWillEnter() {
    var eventData = {'mode': this.params.data.mode};
    if (this.params.data.mode === 'edit') {
      eventData['contestId'] = this.params.data.contestLocalCopy._id;
    }
    this.client.logEvent('page/setContestAdmin', eventData);
  }

  onPageDidLeave() {
    //For some reason manipulating the numbers turns them to strings in the model
    this.params.data.contestLocalCopy.teams[0].score = parseInt(this.params.data.contestLocalCopy.teams[0].score);
    this.params.data.contestLocalCopy.teams[1].score = parseInt(this.params.data.contestLocalCopy.teams[1].score);
  }

  startDateSelected(dateSelection: CalendarCell) {
    if (this.params.data.mode === 'add') {
      var nowDate = new Date();
      nowDate.clearTime();
      var nowEpoch = nowDate.getTime();
      if (dateSelection.epochLocal > nowEpoch) {
        //Future date - move end date respectfully
        this.params.data.contestLocalCopy.endDate += dateSelection.epochLocal - nowEpoch;
      }
    }

    this.params.data.contestLocalCopy.startDate = dateSelection.epochLocal;
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
    }, () => {
      //Do nothing on cancel
    });
  }

}
