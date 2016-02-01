import {Page, NavParams} from 'ionic/ionic';
import {Form, FormBuilder, Control, ControlGroup, Validators,FORM_DIRECTIVES} from 'angular2/common';
import {DatePickerComponent} from '../../components/date-picker/date-picker';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as paymentService from '../../providers/payments';
import * as alertService from '../../providers/alert';

@Page({
  templateUrl: 'build/pages/set-contest/set-contest.html',
  directives: [FORM_DIRECTIVES, DatePickerComponent]
})

export class SetContestPage {

  client:Client;
  params:NavParams;

  minContestStart:Date;
  maxContestStart:Date;
  minContestEnd:Date;
  maxContestEnd:Date;
  startDate:Date;
  endDate:Date;
  showRemoveContest:Boolean;
  contestLocalCopy:Object;
  showStartDate:Boolean;
  showAdminInfo:Boolean;
  buyInProgress:Boolean;
  endOptionKeys:Array<string>;

  contestForm:ControlGroup;
  team0:Control;
  team1:Control;
  contestNameChanged:boolean;

  constructor(params:NavParams, formBuilder:FormBuilder) {

    this.client = Client.getInstance();
    this.params = params;

    this.endOptionKeys = Object.keys(this.client.settings.newContest.endOptions);

    this.team0 = new Control('', Validators.required);
    this.team1 = new Control('', Validators.required);

    this.contestForm = formBuilder.group({
      team0: this.team0,
      team1: this.team1
    }, {validator: this.matchingTeamsValidator});

    //Start date is today, end date is by default within 24 hours
    this.startDate = new Date();
    this.startDate.clearTime();
    this.endDate = new Date(this.startDate.getTime() + 1 * 24 * 60 * 60 * 1000);

    this.showRemoveContest = false;

    if (this.params.data.mode === 'edit') {
      this.contestLocalCopy = JSON.parse(JSON.stringify(this.params.data.contest));
      //Server stores in epoch - client uses real DATE objects
      this.contestLocalCopy.startDate = new Date(this.contestLocalCopy.startDate);
      this.contestLocalCopy.endDate = new Date(this.contestLocalCopy.startDate);

      if (this.contestLocalCopy.participants > 0) {
        this.showStartDate = false;
      }
      else {
        this.showStartDate = true;
      }

      if (this.contestLocalCopy.content.source === 'trivia' && this.contestLocalCopy.content.category.id === 'user') {
        retrieveUserQuestions();
      }
    }
    else if (this.params.data.mode === 'add') {
      //Create new local instance of a contest
      this.contestLocalCopy = {
        'startDate': this.startDate,
        'endDate': this.endDate,
        'endOption': 'h24',
        'content': this.params.data.content,
        'participants': 0,
        'manualParticipants': 0,
        'manualRating': 0,
        'teams': [{'name': null, 'score': 0}, {'name': null, 'score': 0}]
      };
      this.showStartDate = true;
    }

    this.client.session.features.newContest.purchaseData.retrieved = false;
    this.showRemoveContest = (this.params.data.mode === 'edit' && this.client.session.isAdmin);

    //-------------------------------------------------------------------------------------------------------------
    //Android Billing
    //-------------------------------------------------------------------------------------------------------------
    if (this.client.user.clientInfo.platform === 'android' && this.client.session.features.newContest.locked) {
      if (!this.client.session.features.newContest.purchaseData.retrieved) {

        //-------------------------------------------------------------------------------------------------------------
        //pricing - replace cost/currency with the google store pricing (local currency, etc.)
        //-------------------------------------------------------------------------------------------------------------
        inappbilling.getProductDetails((products) => {
            //In android - the price already contains the symbol
            this.client.session.features.newContest.purchaseData.formattedCost = products[0].price;
            this.client.session.features.newContest.purchaseData.cost = products[0].price_amount_micros / 1000000;
            this.client.session.features.newContest.purchaseData.currency = products[0].price_currency_code;

            this.client.session.features.newContest.purchaseData.retrieved = true;

            //-------------------------------------------------------------------------------------------------------------
            //Retrieve unconsumed items - and checking if user has an unconsumed 'new contest unlock key'
            //-------------------------------------------------------------------------------------------------------------
            inappbilling.getPurchases((unconsumedItems) => {
                if (unconsumedItems && unconsumedItems.length > 0) {
                  for (var i = 0; i < unconsumedItems.length; i++) {
                    if (unconsumedItems[i].productId === this.client.session.features.newContest.purchaseData.productId) {
                      processAndroidPurchase(unconsumedItems[i]);
                      break;
                    }
                  }
                }
              },
              (error) => {
                FlurryAgent.myLogError('AndroidBillingError', 'Error retrieving unconsumed items: ' + error);
              });

          },
          function (msg) {
            FlurryAgent.myLogError('AndroidBillingError', 'Error getting product details: ' + msg);
          }, this.client.session.features.newContest.purchaseData.productId);
      }
    }
    else {
      this.client.session.features.newContest.purchaseData.retrieved = true;
    }

    this.contestLocalCopy.totalParticipants = this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants;
    this.showAdminInfo = false;

    this.setDateLimits();

  }

  retrieveUserQuestions() {
    var postData = {'userQuestions': this.contestLocalCopy.userQuestions};
    this.client.serverPost('contests/getQuestions', postData).then((questions) => {
      this.contestLocalCopy.questions = {'visibleCount': questions.length, 'list': questions};
    });
  }

  getTitle() {
    switch (this.params.data.mode) {
      case 'add':
        return this.client.translate('NEW_CONTEST');

      case 'edit':
        return this.client.translate('EDIT_CONTEST');

      default:
        return this.client.translate('WHO_IS_SMARTER');
    }
  }

  processAndroidPurchase(purchaseData) {

    return new Promise((resolve, reject) => {

      var extraPurchaseData = {
        'actualCost': this.client.session.features.newContest.purchaseData.cost,
        'actualCurrency': this.client.session.features.newContest.purchaseData.currency,
        'featurePurchased': this.client.session.features.newContest.name
      };

      paymentService.processPayment('android', purchaseData, extraPurchaseData).then((serverPurchaseData) => {

        //TODO: ionic loading...

        inappbilling.consumePurchase((purchaseData) => {

            //TODO: hide ionic loading...

            if (resolve) {
              resolve(purchaseData);
            }
            paymentService.showPurchaseSuccess(serverPurchaseData);
          }, (error) => {
            //TODO: hide ionic loading...
            FlurryAgent.myLogError('AndroidBilling', 'Error consuming product: ' + error);
            if (reject) {
              reject();
            }
          },
          purchaseData.productId);
      });

    });
  }

  buyNewContestUnlockKey(isMobile) {

    this.buyInProgress = true;
    paymentService.buy(this.client.session.features.newContest, isMobile.then((result) => {
        switch (result.method) {
          case 'paypal':
            location.replace(result.data.url);
            break;

          case 'facebook':
            if (result.data.status === 'completed') {
              paymentService.processPayment(result.method, result.data, null).then((serverPurchaseData) => {
                  //Update local assets
                  this.buyInProgress = false;
                  paymentService.showPurchaseSuccess(serverPurchaseData);
                }, (error) => {
                  this.buyInProgress = false;
                }
              )
            }
            else if (result.data.status === 'initiated') {
              //Payment might come later from server
              alertService.alert({'type': 'SERVER_ERROR_PURCHASE_IN_PROGRESS'});
            }
            else {
              //Probably user canceled
              this.buyInProgress = false;
            }
            break;

          case 'android':
            this.processAndroidPurchase(result.data).then((data) => {
                this.buyInProgress = false;
              },
              (error) => {
                this.buyInProgress = false;
              })
            break;
        }
      }, (error) => {
        this.buyInProgress = false;
      }
    ))
  };

  toggleAdminInfo() {
    if (this.contestLocalCopy.teams[0].name && this.contestLocalCopy.teams[1].name) {
      this.showAdminInfo = !this.showAdminInfo;
    }
  };

  getArrowDirection(stateClosed) {
    if (stateClosed) {
      if (this.client.currentLanguage.direction === 'ltr') {
        return "►";
      }
      else {
        return "◄";
      }
    }
    else {
      return "▼";
    }
  }

  removeContest() {

    alertService.confirm('CONFIRM_REMOVE_TITLE', 'CONFIRM_REMOVE_TEMPLATE', {name: this.contestLocalCopy.name}).then(() => {
      contestsService.removeContest(this.contestLocalCopy._id).then((data) => {
        this.client.nav.pop();
        this.client.events.publish('topTeamer-contestRemoved', data);
      })
    });
  }

  setContest() {

    if (this.contestLocalCopy.content.source === 'trivia' && this.contestLocalCopy.content.category.id === 'user') {
      if (!this.contestLocalCopy.questions || this.contestLocalCopy.questions.visibleCount < this.client.settings.newContest.privateQuestions.min) {
        //TODO - min questions check
        //minimumQuestionsSingle
        //minimumQuestionsPlural
        return;
      }
    }

    //Tweak the manual participants
    if (this.contestLocalCopy.totalParticipants > this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants) {
      this.contestLocalCopy.manualParticipants += this.contestLocalCopy.totalParticipants - (this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants)
    }

    delete this.contestLocalCopy['totalParticipants'];

    delete this.contestLocalCopy['status'];

    //Server stores in epoch - client uses real DATE objects
    //Convert back to epoch before storing to server
    this.contestLocalCopy.startDate = this.contestLocalCopy.startDate.getTime();
    this.contestLocalCopy.endDate = this.contestLocalCopy.endDate.getTime();

    if (this.params.data.mode === 'add' || (this.params.data.mode === 'edit' && JSON.stringify(this.params.data.contest) != JSON.stringify(this.contestLocalCopy))) {

      this.contestLocalCopy.name = this.client.translate('FULL_CONTEST_NAME', {
        'team0': this.contestLocalCopy.teams[0].name,
        'team1': this.contestLocalCopy.teams[1].name
      });

      if (this.params.data.mode === 'edit' && this.contestLocalCopy.name !== this.params.data.contest.name) {
        this.contestNameChanged = true;
      }

      contestsService.setContest(this.contestLocalCopy, this.params.data.mode, this.contestNameChanged).then((contest) => {

        this.contestLocalCopy.startDate = new Date(this.contestLocalCopy.startDate);
        this.contestLocalCopy.endDate = new Date(this.contestLocalCopy.endDate);

        //Report to Flurry
        var contestParams = {
          'team0': this.contestLocalCopy.teams[0].name,
          'team1': this.contestLocalCopy.teams[1].name,
          'duration': this.contestLocalCopy.endOption,
          'questionsSource': this.contestLocalCopy.questionsSource
        };

        if (this.params.data.mode === 'add') {
          FlurryAgent.logEvent('contest/created', contestParams);
          setTimeout(() => {
            this.client.events.publish('topTeamer:contestCreated', this.quizData.results)
          }, 1000);
        }
        else {
          FlurryAgent.logEvent('contest/updated', contestParams);
          setTimeout(() => {
            this.client.events.publish('topTeamer:contestUpdated', this.quizData.results)
          }, 1000);
        }

        this.client.nav.pop();

      }, (error) => {
        this.contestLocalCopy.startDate = new Date(this.contestLocalCopy.startDate);
        this.contestLocalCopy.endDate = new Date(this.contestLocalCopy.endDate);
      });
    }
    else {
      this.client.nav.pop();
    }
  }

  matchingTeamsValidator(group:ControlGroup) {
    let val;
    let valid = true;

    for (name in group.controls) {
      if (val === undefined) {
        val = group.controls[name].value;
      }
      else {
        if (val === group.controls[name].value) {
          valid = false;
          break;
        }
      }
    }

    if (valid) {
      return null;
    }

    return {matchingTeams: true};
  }

  startDateSelected(dateSelection) {
    if (dateSelection.dateObject > this.contestLocalCopy.endDate) {
      return false;
    }
    this.contestLocalCopy.startDate = dateSelection.dateObject;
    return true;
  }

  endDateSelected(dateSelection) {
    if (dateSelection.dateObject < this.contestLocalCopy.startDate) {
      return false;
    }
    this.contestLocalCopy.endDate = dateSelection.dateObject;
    return true;
  }

  setDateLimits() {
    if (!this.client.session.isAdmin) {
      this.minContestStart = this.startDate;
      this.minContestEnd = this.startDate;
      this.maxContestEnd = this.getMaxEndDate();
    }
    else {
      var pastDate = new Date(1970, 0, 1, 0, 0, 0);
      this.minContestStart = pastDate;
      this.minContestEnd = pastDate;
      this.maxContestEnd = new Date(2100, 0, 1, 0, 0, 0);
    }
  }

  getMaxEndDate() {
    //Set the maximum end date according to the last end option in the list
    return new Date(this.contestLocalCopy.startDate.getTime() + this.client.settings.newContest.endOptions[this.endOptionKeys[this.endOptionKeys.length-1]].msecMultiplier);
  }
}
