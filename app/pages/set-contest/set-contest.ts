import {Page, NavParams, Item, Select, Label,Modal} from 'ionic-angular';
import {Form, FormBuilder, Control, ControlGroup, Validators,FORM_DIRECTIVES} from 'angular2/common';
import {DatePickerComponent} from '../../components/date-picker/date-picker';
import {Client} from '../../providers/client';
import {ContestPage} from '../../pages/contest/contest';
import {QuestionEditorPage} from '../../pages/question-editor/question-editor';
import {SearchQuestionsPage} from '../../pages/search-questions/search-questions';
import {MobileSharePage} from '../../pages/mobile-share/mobile-share';
import * as contestsService from '../../providers/contests';
import * as paymentService from '../../providers/payments';
import * as alertService from '../../providers/alert';
import * as shareService from '../../providers/share';
import {Contest,Team, PaymentData} from '../../objects/objects';

@Page({
  templateUrl: 'build/pages/set-contest/set-contest.html',
  directives: [FORM_DIRECTIVES, DatePickerComponent]
})

export class SetContestPage {

  client:Client;
  params:NavParams;

  minContestStart:number;
  maxContestStart:number;
  minContestEnd:number;
  maxContestEnd:number;
  startDate:number;
  endDate:number;
  showRemoveContest:Boolean;
  contestLocalCopy:Contest;
  showStartDate:Boolean;
  showAdminInfo:Boolean;
  buyInProgress:Boolean;
  endOptionKeys:Array<string>;

  contestForm:ControlGroup;
  team0:Control;
  team1:Control;
  contestNameChanged:Boolean;
  userQuestionsInvalid:String;
  submitted:Boolean;

  constructor(params:NavParams, formBuilder:FormBuilder) {

    this.client = Client.getInstance();
    this.params = params;

    this.endOptionKeys = Object.keys(this.client.settings['newContest'].endOptions);

    this.team0 = new Control('', Validators.required);
    this.team1 = new Control('', Validators.required);

    this.contestForm = formBuilder.group({
      team0: this.team0,
      team1: this.team1
    }, {validator: this.matchingTeamsValidator});

    //Start date is today, end date is by default within 24 hours
    var now = new Date();
    now.clearTime();
    this.startDate = now.getTime();
    this.endDate = this.startDate + 1 * 24 * 60 * 60 * 1000;

    this.showRemoveContest = false;

    if (this.params.data.mode === 'edit') {
      this.contestLocalCopy = JSON.parse(JSON.stringify(this.params.data.contest));

      if (this.contestLocalCopy.participants > 0) {
        this.showStartDate = false;
      }
      else {
        this.showStartDate = true;
      }

      if (this.contestLocalCopy.type.id === 'userTrivia') {
        this.retrieveUserQuestions();
      }
    }
    else if (this.params.data.mode === 'add') {
      //Create new local instance of a contest
      this.contestLocalCopy = new Contest(this.startDate, this.endDate, this.params.data.type);
      this.showStartDate = true;
      this.contestLocalCopy.questions = {'visibleCount': 0, 'list': []};
    }

    this.client.session.features['newContest'].purchaseData.retrieved = false;
    this.showRemoveContest = (this.params.data.mode === 'edit' && this.client.session.isAdmin);

    //-------------------------------------------------------------------------------------------------------------
    //Android Billing
    //-------------------------------------------------------------------------------------------------------------
    if (this.client.user.clientInfo.platform === 'android' && this.client.session.features['newContest'].locked) {
      if (!this.client.session.features['newContest'].purchaseData.retrieved) {

        //-------------------------------------------------------------------------------------------------------------
        //pricing - replace cost/currency with the google store pricing (local currency, etc.)
        //-------------------------------------------------------------------------------------------------------------
        window.inappbilling.getProductDetails((products) => {
            //In android - the price already contains the symbol
            this.client.session.features['newContest'].purchaseData.formattedCost = products[0].price;
            this.client.session.features['newContest'].purchaseData.cost = products[0].price_amount_micros / 1000000;
            this.client.session.features['newContest'].purchaseData.currency = products[0].price_currency_code;

            this.client.session.features['newContest'].purchaseData.retrieved = true;

            //-------------------------------------------------------------------------------------------------------------
            //Retrieve unconsumed items - and checking if user has an unconsumed 'new contest unlock key'
            //-------------------------------------------------------------------------------------------------------------
            window.inappbilling.getPurchases((unconsumedItems) => {
                if (unconsumedItems && unconsumedItems.length > 0) {
                  for (var i = 0; i < unconsumedItems.length; i++) {
                    if (unconsumedItems[i].productId === this.client.session.features['newContest'].purchaseData.productId) {
                      this.processAndroidPurchase(unconsumedItems[i]);
                      break;
                    }
                  }
                }
              },
              (error) => {
                window.myLogError('AndroidBillingError', 'Error retrieving unconsumed items: ' + error);
              });

          },
          function (msg) {
            this.client.logError('AndroidBillingError', 'Error getting product details: ' + msg);
          }, this.client.session.features['newContest'].purchaseData.productId);
      }
    }
    else {
      this.client.session.features['newContest'].purchaseData.retrieved = true;
    }

    this.contestLocalCopy.totalParticipants = this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants;
    this.showAdminInfo = false;

    this.setDateLimits();

  }

  onPageWillEnter() {
    var eventData = {'mode' : this.params.data.mode};
    if (this.params.data.mode === 'edit') {
      eventData['contestId'] = this.params.data.contest._id;
    }
    this.client.logEvent('page/setContest', eventData);
    this.submitted = false;
  }

  retrieveUserQuestions() {
    contestsService.getQuestions(this.contestLocalCopy.userQuestions).then((questions) => {
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
        return this.client.translate('GAME_NAME');
    }
  }

  processAndroidPurchase(purchaseData) {

    return new Promise<string>((resolve, reject) => {

      var extraPurchaseData = {
        'actualCost': this.client.session.features['newContest'].purchaseData.cost,
        'actualCurrency': this.client.session.features['newContest'].purchaseData.currency,
        'featurePurchased': this.client.session.features['newContest'].name
      };

      paymentService.processPayment('android', purchaseData, extraPurchaseData).then((serverPurchaseData) => {

        this.client.showSpinner = true;

        window.inappbilling.consumePurchase((purchaseData) => {

            this.client.showSpinner = false;

            if (resolve) {
              resolve(purchaseData);
            }
            paymentService.showPurchaseSuccess(serverPurchaseData);
          }, (error) => {

            this.client.showSpinner = false;
            window.myLogError('AndroidBilling', 'Error consuming product: ' + error);
            if (reject) {
              reject();
            }
          },
          purchaseData.productId);
      });

    });
  }

  buyNewContestUnlockKey(isMobile) {
debugger;
    this.buyInProgress = true;
    paymentService.buy(this.client.session.features['newContest'], isMobile).then((result: PaymentData) => {
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
    )
  };

  toggleAdminInfo() {
    if (this.contestLocalCopy.teams[0].name && this.contestLocalCopy.teams[1].name) {
      this.showAdminInfo = !this.showAdminInfo;
    }
  };

  getArrowDirection(stateClosed) {
    if (stateClosed) {
      if (this.client.currentLanguage.direction === 'ltr') {
        return '►';
      }
      else {
        return '◄';
      }
    }
    else {
      return '▼';
    }
  }

  removeContest() {
    this.client.logEvent('contest/remove/click', {'contestId' : this.contestLocalCopy._id});
    alertService.confirm('CONFIRM_REMOVE_TITLE', 'CONFIRM_REMOVE_TEMPLATE', {name: this.contestLocalCopy.name}).then(() => {
      this.client.logEvent('contest/removed', {'contestId' : this.contestLocalCopy._id});
      contestsService.removeContest(this.contestLocalCopy._id).then(() => {
        this.client.events.publish('topTeamer:contestRemoved');
        setTimeout(() => {
          this.client.nav.popToRoot({animate: false});
        }, 1000);
      });
    });
  }

  userQuestionsMinimumCheck() {
    if (this.client.settings['newContest'].privateQuestions.min === 1) {
      this.userQuestionsInvalid = this.client.translate('SERVER_ERROR_MINIMUM_USER_QUESTIONS_SINGLE_MESSAGE', {minimum: this.client.settings['newContest'].privateQuestions.min});
    }
    else {
      this.userQuestionsInvalid = this.client.translate('SERVER_ERROR_MINIMUM_USER_QUESTIONS_SINGLE_MESSAGE', {minimum: this.client.settings['newContest'].privateQuestions.min});
    }

    if (this.userQuestionsInvalid) {
      return true;
    }
    else {
      return false;
    }
  }

  maxQuestionsReached() {
    return (this.contestLocalCopy.questions && this.contestLocalCopy.questions.visibleCount === this.client.settings['newContest'].privateQuestions.max);
  }

  openQuestionEditor(mode, question) {

    if (mode === 'add') {
      if (this.maxQuestionsReached()) {
        alertService.alert(this.client.translate('MAX_USER_QUESTIONS_REACHED', {max: this.client.settings['newContest'].privateQuestions.max}));
        return;
      }
    }

    var modal = Modal.create(QuestionEditorPage, {'question': question, 'mode': mode, 'currentQuestions' : this.contestLocalCopy.questions});
    modal.onDismiss((result) => {
      if (!result) {
        return;
      }

      this.userQuestionsInvalid = null;

      if (!result.question._id) {
        //New questions
        result.question._id = 'new';
        this.contestLocalCopy.questions.list.push(result.question);
        this.contestLocalCopy.questions.visibleCount++;
      }
      else if (result.question._id !== 'new') {
        //Set dirty flag for the question - so server will update it in the db
        result.question.isDirty = true;
      }
    });

    this.client.nav.present(modal);
  }

  openSearchQuestions() {

    if (this.maxQuestionsReached()) {
      alertService.alert(this.client.translate('MAX_USER_QUESTIONS_REACHED', {max: this.client.settings['newContest'].privateQuestions.max}));
      return;
    }

    var modal = Modal.create(SearchQuestionsPage, {'currentQuestions': this.contestLocalCopy.questions});

    this.client.nav.present(modal);

  }

  removeQuestion(index) {

    alertService.confirm('REMOVE_QUESTION', 'CONFIRM_REMOVE_QUESTION').then(() => {
      if (this.contestLocalCopy.questions.list && index < this.contestLocalCopy.questions.list.length) {
        if (this.contestLocalCopy.questions.list[index]._id && this.contestLocalCopy.questions.list[index]._id !== 'new') {
          //Question has an id in the database - logically remove
          this.contestLocalCopy.questions.list[index].deleted = true;
        }
        else {
          //Question does not have an actual id in the database - physically remove
          this.contestLocalCopy.questions.list.splice(index, 1);
        }
        this.contestLocalCopy.questions.visibleCount--;
      }
    });
  };

  setContest() {

    this.client.logEvent('contest/set');
    this.submitted = true;
    if (!this.contestForm.valid) {
      return;
    }

    if (this.contestLocalCopy.type.id === 'userTrivia') {
      if (!this.contestLocalCopy.questions || this.contestLocalCopy.questions.visibleCount < this.client.settings['newContest'].privateQuestions.min) {

        if (!this.userQuestionsMinimumCheck()) {
          return;
        }
      }
    }

    //Tweak the manual participants
    if (this.contestLocalCopy.totalParticipants > this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants) {
      this.contestLocalCopy.manualParticipants += this.contestLocalCopy.totalParticipants - (this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants)
    }

    delete this.contestLocalCopy['totalParticipants'];

    delete this.contestLocalCopy['status'];

    if (this.params.data.mode === 'add' || (this.params.data.mode === 'edit' && JSON.stringify(this.params.data.contest) != JSON.stringify(this.contestLocalCopy))) {

      this.contestLocalCopy.name = this.client.translate('CONTEST_NAME', {
        'team0': this.contestLocalCopy.teams[0].name,
        'team1': this.contestLocalCopy.teams[1].name,
        'type': this.client.translate(this.contestLocalCopy.type.name)
      });

      if (this.params.data.mode === 'edit' && this.contestLocalCopy.name !== this.params.data.contest.name) {
        this.contestNameChanged = true;
      }

      contestsService.setContest(this.contestLocalCopy, this.params.data.mode, this.contestNameChanged).then((contest) => {

        //Report to Flurry
        var contestParams = {
          'team0': this.contestLocalCopy.teams[0].name,
          'team1': this.contestLocalCopy.teams[1].name,
          'duration': this.contestLocalCopy.endOption,
          'typeId': this.contestLocalCopy.type.id
        };

        if (this.params.data.mode === 'add') {
          this.client.logEvent('contest/created', contestParams);
          this.client.events.publish('topTeamer:contestCreated', contest);
          var options = {animate: false};
          this.client.nav.pop(options).then(() => {
            if (!this.client.user.clientInfo.mobile) {
              //For web - no animation - the share screen will be on top with its animation
              this.client.nav.push(ContestPage, {'contest': contest}).then(() => {
                shareService.share('newContestWebPopup', contest);
              });
            }
            else {
              //Mobile - open the share mobile modal - with one button - to share or skip
              this.client.nav.push(ContestPage, {'contest': contest}).then(() => {
                var modal = Modal.create(MobileSharePage, {'contest' : contest});
                this.client.nav.present(modal);
              });
            }
          });
        }
        else {
          this.client.logEvent('contest/updated', contestParams);
          this.client.events.publish('topTeamer:contestUpdated', contest);
          this.client.nav.pop();
        }
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

      //Empty value in one of the teams will be caught in the required validator
      if (!group.controls[name].value) {
        return null;
      }

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

  //TODO: validate startDate<endDate
  startDateSelected(dateSelection) {
    if (dateSelection.epochLocal > this.contestLocalCopy.endDate) {
      return false;
    }
    this.contestLocalCopy.startDate = dateSelection.epochLocal;
    return true;
  }

  endDateSelected(dateSelection) {
    if (dateSelection.epochLocal < this.contestLocalCopy.startDate) {
      return false;
    }
    this.contestLocalCopy.endDate = dateSelection.epochLocal;
    return true;
  }

  setDateLimits() {
    if (!this.client.session.isAdmin) {
      this.minContestStart = this.startDate;
      this.minContestEnd = this.startDate;
      this.maxContestEnd = this.getMaxEndDate();
    }
    else {
      var pastDate = (new Date(1970, 0, 1, 0, 0, 0)).getTime();
      this.minContestStart = pastDate;
      this.minContestEnd = pastDate;
      this.maxContestEnd = (new Date(2100, 0, 1, 0, 0, 0)).getTime();
    }
  }

  getMaxEndDate() {
    //Set the maximum end date according to the last end option in the list
    return this.contestLocalCopy.startDate + this.client.settings['newContest'].endOptions[this.endOptionKeys[this.endOptionKeys.length - 1]].msecMultiplier;
  }
}
