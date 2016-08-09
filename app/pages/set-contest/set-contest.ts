import {Component} from '@angular/core';
import {Form, FormBuilder, Control, ControlGroup, Validators} from '@angular/common';
import {NavParams} from 'ionic-angular';
import {DatePickerComponent} from '../../components/date-picker/date-picker';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as paymentService from '../../providers/payments';
import * as alertService from '../../providers/alert';
import {Contest,ContestName, Questions, Team, PaymentData, AppPage} from '../../objects/objects';

@Component({
  templateUrl: 'build/pages/set-contest/set-contest.html',
  directives: [DatePickerComponent]
})

export class SetContestPage {

  client:Client;
  params:NavParams;

  nowWithoutTimeEpoch:number;
  currentTimeOnlyInMilliseconds:number;
  contestLocalCopy:Contest;
  buyInProgress:boolean;
  team0Control:Control;
  team1Control:Control;
  matchingTeamsControlGroup:ControlGroup;
  subjectControl:Control;
  endOptionKeys:Array<string>;
  title:string;
  contestForm:ControlGroup;
  userQuestionsInvalid:string;
  submitted:boolean;
  readOnlySubjectAlerted:boolean;

  constructor(params:NavParams, formBuilder:FormBuilder) {

    this.client = Client.getInstance();
    this.params = params;

    this.endOptionKeys = Object.keys(this.client.settings.newContest.endOptions);

    this.team0Control = new Control('', Validators.required);
    this.team1Control = new Control('', Validators.required);
    this.subjectControl = new Control('', Validators.required);
    this.matchingTeamsControlGroup = formBuilder.group({
      team0Control: this.team0Control,
      team1Control: this.team1Control
    }, {validator: this.matchingTeamsValidator});

    this.contestForm = formBuilder.group({
      matchingTeamsControlGroup: this.matchingTeamsControlGroup,
      subjectControl: this.subjectControl
    });

    //Start date is today, end date is by default as set by the server
    var nowWithTime = new Date();

    var nowWithoutTime = new Date();
    nowWithoutTime.clearTime();
    this.currentTimeOnlyInMilliseconds = nowWithTime.getTime() - nowWithoutTime.getTime();
    this.nowWithoutTimeEpoch = nowWithoutTime.getTime();

    if (this.params.data.mode === 'edit') {
      this.contestLocalCopy = contestsService.cloneForEdit(this.params.data.contest);

      if (this.contestLocalCopy.type.id === 'userTrivia') {
        this.retrieveUserQuestions();
      }
    }
    else if (this.params.data.mode === 'add') {

      var endOption;
      for (var i = 0; i < this.endOptionKeys.length; i++) {
        if (this.client.settings['newContest'].endOptions[this.endOptionKeys[i]].isDefault) {
          endOption = this.endOptionKeys[i];
          break;
        }
      }
      if (!endOption) {
        //If no default - set the last as default
        endOption = this.endOptionKeys[this.endOptionKeys.length - 1];
      }

      this.contestLocalCopy = new Contest(this.params.data.typeId, this.nowWithoutTimeEpoch + this.currentTimeOnlyInMilliseconds, null, endOption);

      //Set contest subject
      this.contestLocalCopy.subject = this.client.translate(this.client.settings.newContest.contestTypes[this.contestLocalCopy.type.id].text.name, {'name': this.client.session.name});

      //Set user questions
      if (this.contestLocalCopy.type.id === 'userTrivia') {
        this.contestLocalCopy.type.questions = new Questions();
      }

    }

    this.client.session.features['newContest'].purchaseData.retrieved = false;

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

  }

  ionViewWillEnter() {
    var eventData = {'mode': this.params.data.mode};
    if (this.params.data.mode === 'edit') {
      eventData['contestId'] = this.params.data.contest._id;
    }
    this.client.logEvent('page/setContest', eventData);
    this.submitted = false;
  }

  retrieveUserQuestions() {
    contestsService.getQuestions(this.contestLocalCopy.type.userQuestions).then((questions) => {
      this.contestLocalCopy.type.questions = {'visibleCount': questions.length, 'list': questions};
    }, () => {
    });
  }

  processAndroidPurchase(purchaseData) {

    return new Promise<string>((resolve, reject) => {

      var extraPurchaseData = {
        'actualCost': this.client.session.features['newContest'].purchaseData.cost,
        'actualCurrency': this.client.session.features['newContest'].purchaseData.currency,
        'featurePurchased': this.client.session.features['newContest'].name
      };

      paymentService.processPayment('android', purchaseData, extraPurchaseData).then((serverPurchaseData) => {

        this.client.showLoader();

        window.inappbilling.consumePurchase((purchaseData) => {

            this.client.hideLoader();

            if (resolve) {
              resolve(purchaseData);
            }
            paymentService.showPurchaseSuccess(serverPurchaseData);
          }, (error) => {

            this.client.hideLoader();
            window.myLogError('AndroidBilling', 'Error consuming product: ' + error);
            if (reject) {
              reject();
            }
          },
          purchaseData.productId);
      }, () => {
      });

    });
  }

  buyNewContestUnlockKey(isMobile) {
    debugger;
    this.buyInProgress = true;
    paymentService.buy(this.client.session.features['newContest'], isMobile).then((result:PaymentData) => {
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
                }, () => {
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
            this.processAndroidPurchase(result.data).then(() => {
                this.buyInProgress = false;
              },
              () => {
                this.buyInProgress = false;
              })
            break;
        }
      }, () => {
        this.buyInProgress = false;
      }
    )
  }

  userQuestionsMinimumError() {

    if (this.userQuestionsInvalid) {
      return true;
    }
    else {
      return false;
    }
  }

  maxQuestionsReached() {
    return (this.contestLocalCopy.type.questions && this.contestLocalCopy.type.questions.visibleCount === this.client.settings['newContest'].privateQuestions.max);
  }

  openQuestionEditor(mode, question) {

    if (mode === 'add') {
      if (this.maxQuestionsReached()) {
        alertService.alert(this.client.translate('MAX_USER_QUESTIONS_REACHED', {max: this.client.settings['newContest'].privateQuestions.max}));
        return;
      }
    }

    var modal = this.client.createModalPage('QuestionEditorPage', {
      'question': question,
      'mode': mode,
      'currentQuestions': this.contestLocalCopy.type.questions
    });
    modal.onDidDismiss((result) => {
      if (!result) {
        return;
      }

      this.userQuestionsInvalid = null;

      if (!result.question._id) {
        //New questions
        result.question._id = 'new';
        this.contestLocalCopy.type.questions.list.push(result.question);
        this.contestLocalCopy.type.questions.visibleCount++;
      }
      else if (result.question._id !== 'new') {
        //Set dirty flag for the question - so server will update it in the db
        result.question.isDirty = true;
      }
    });

    modal.present();
  }

  openSearchQuestions() {

    if (this.maxQuestionsReached()) {
      alertService.alert(this.client.translate('MAX_USER_QUESTIONS_REACHED', {max: this.client.settings['newContest'].privateQuestions.max}));
      return;
    }

    this.client.showModalPage('SearchQuestionsPage', {'currentQuestions': this.contestLocalCopy.type.questions});
  }

  removeQuestion(index) {

    alertService.confirm('REMOVE_QUESTION', 'CONFIRM_REMOVE_QUESTION').then(() => {
      if (this.contestLocalCopy.type.questions.list && index < this.contestLocalCopy.type.questions.list.length) {
        if (this.contestLocalCopy.type.questions.list[index]._id && this.contestLocalCopy.type.questions.list[index]._id !== 'new') {
          //Question has an id in the database - logically remove
          this.contestLocalCopy.type.questions.list[index].deleted = true;
        }
        else {
          //Question does not have an actual id in the database - physically remove
          this.contestLocalCopy.type.questions.list.splice(index, 1);
        }
        this.contestLocalCopy.type.questions.visibleCount--;
      }
    }, () => {
      //do nothing on cancel
    });
  }

  setContest() {

    this.client.logEvent('contest/set');
    this.submitted = true;
    if (!this.contestForm.valid) {
      return;
    }

    //Check min questions in user Trivia
    if (this.contestLocalCopy.type.id === 'userTrivia') {
      if (!this.contestLocalCopy.type.questions || this.contestLocalCopy.type.questions.visibleCount < this.client.settings['newContest'].privateQuestions.min) {

        if (this.client.settings['newContest'].privateQuestions.min === 1) {
          this.userQuestionsInvalid = this.client.translate('SERVER_ERROR_MINIMUM_USER_QUESTIONS_SINGLE_MESSAGE', {minimum: this.client.settings['newContest'].privateQuestions.min});
        }
        else {
          this.userQuestionsInvalid = this.client.translate('SERVER_ERROR_MINIMUM_USER_QUESTIONS_SINGLE_MESSAGE', {minimum: this.client.settings['newContest'].privateQuestions.min});
        }

        return;
      }
    }

    let isDirty:boolean = false;
    if (this.params.data.mode === 'add') {
      isDirty = true;
    }
    else {
      //edit mode
      if (this.contestLocalCopy.teams[0].name !== this.params.data.contest.teams[0].name ||
        this.contestLocalCopy.teams[1].name !== this.params.data.contest.teams[1].name ||
        this.contestLocalCopy.subject !== this.params.data.contest.subject) {
        isDirty = true;
      }
      if (!isDirty &&
        (this.contestLocalCopy.startDate !== this.params.data.contest.startDate ||
        this.contestLocalCopy.endDate !== this.params.data.contest.endDate ||
        (this.contestLocalCopy.teams[0].score !== undefined && this.params.data.contest.teams[0].score !== undefined && this.contestLocalCopy.teams[0].score !== this.params.data.contest.teams[0].score) ||
        (this.contestLocalCopy.teams[1].score !== undefined && this.params.data.contest.teams[1].score !== undefined && this.contestLocalCopy.teams[1].score !== this.params.data.contest.teams[1].score) ||
        (this.contestLocalCopy.systemParticipants !== undefined && this.params.data.contest.systemParticipants !== undefined && this.contestLocalCopy.systemParticipants !== this.params.data.contest.systemParticipants) ||
        (this.contestLocalCopy.rating !== undefined && this.params.data.contest.rating !== undefined && this.contestLocalCopy.rating !== this.params.data.contest.rating))) {
        isDirty = true;
      }
      if (!isDirty && this.contestLocalCopy.type.id === 'userTrivia' && JSON.stringify(this.contestLocalCopy.type) !== JSON.stringify(this.params.data.contest.type)) {
        isDirty = true;
      }
    }

    if (isDirty) {

      if (this.client.session.isAdmin) {
        //Check if scores have changed and update the deltas
        if (this.contestLocalCopy.teams[0].score !== undefined) {
          if (this.params.data.mode === 'edit' && this.contestLocalCopy.teams[0].score !== this.params.data.contest.teams[0].score) {
            this.contestLocalCopy.teams[0].adminScoreAddition = this.contestLocalCopy.teams[0].score - this.params.data.contest.teams[0].score;
          }
          else if (this.params.data.mode === 'add') {
            this.contestLocalCopy.teams[0].adminScoreAddition = this.contestLocalCopy.teams[0].score;
          }
          delete this.contestLocalCopy.teams[0].score;
        }
        if (this.contestLocalCopy.teams[1].score !== undefined) {
          if (this.params.data.mode === 'edit' && this.contestLocalCopy.teams[1].score !== this.params.data.contest.teams[1].score) {
            this.contestLocalCopy.teams[1].adminScoreAddition = this.contestLocalCopy.teams[1].score - this.params.data.contest.teams[1].score;
          }
          else if (this.params.data.mode === 'add') {
            this.contestLocalCopy.teams[1].adminScoreAddition = this.contestLocalCopy.teams[1].score;
          }
          delete this.contestLocalCopy.teams[1].score;
        }
      }

      contestsService.setContest(this.contestLocalCopy, this.params.data.mode).then((contest) => {

        //Report to Analytics
        var contestParams = {
          'team0': this.contestLocalCopy.teams[0].name,
          'team1': this.contestLocalCopy.teams[1].name,
          'duration': this.contestLocalCopy.endOption,
          'typeId': this.contestLocalCopy.type.id
        };

        if (this.params.data.mode === 'add') {
          this.client.logEvent('contest/created', contestParams);
          this.client.events.publish('topTeamer:contestCreated', contest);
          this.client.nav.pop({animate: false}).then(() => {
            let appPages : Array<AppPage> = new Array<AppPage>();
            appPages.push(new AppPage('ContestPage', {'contest': contest}));
            appPages.push(new AppPage('SharePage', {'contest': contest, 'source': 'newContest'}));
            this.client.insertPages(appPages);
          }, () => {
          });
        }
        else {
          this.client.logEvent('contest/updated', contestParams);
          let now:number = (new Date).getTime();
          let currentStatus: string = contestsService.getContestStatus(this.contestLocalCopy);
          let previousStatus: string = contestsService.getContestStatus(this.params.data.contest);
          this.client.events.publish('topTeamer:contestUpdated', contest, previousStatus, currentStatus);
          this.client.nav.pop();
        }
      }, () => {
      });
    }
    else {
      this.client.nav.pop();
    }
  }

  matchingTeamsValidator(group:ControlGroup) {

    let value;
    let valid = true;

    for (name in group.controls) {

      //Empty value in one of the teams will be caught in the required validator
      if (!group.controls[name].value) {
        return null;
      }

      if (value === undefined) {
        value = group.controls[name].value;
      }
      else {
        if (value && group.controls[name].value && value.trim() === group.controls[name].value.trim()) {
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

  setEndsIn() {
    this.contestLocalCopy.endDate = this.getEndDateAccordingToEndsIn(this.contestLocalCopy.endOption);
    this.client.logEvent('newContest/endsIn/click', {'endsIn': this.contestLocalCopy.endOption});
  }

  getEndDateAccordingToEndsIn(endsIn:string) {
    var endOption = this.client.settings['newContest'].endOptions[endsIn];
    var endDate = this.nowWithoutTimeEpoch + this.currentTimeOnlyInMilliseconds + (endOption.number * endOption.msecMultiplier);
    return endDate;
  }

  setAdminInfo() {

    if (!this.contestLocalCopy.systemParticipants) {
      this.contestLocalCopy.systemParticipants = 0;
    }

    if (!this.contestLocalCopy.rating) {
      this.contestLocalCopy.rating = 0;
    }

    if (!this.contestLocalCopy.teams[0].score && this.contestLocalCopy.teams[0].score !== 0) {
      if (this.params.data.mode === 'edit') {
        this.contestLocalCopy.teams[0].score = this.params.data.contest.teams[0].score;
      }
      else {
        this.contestLocalCopy.teams[0].score = 0;
      }
      this.contestLocalCopy.teams[0].adminScoreAddition = 0;
    }
    if (!this.contestLocalCopy.teams[1].score && this.contestLocalCopy.teams[1].score !== 0) {
      if (this.params.data.mode === 'edit') {
        this.contestLocalCopy.teams[1].score = this.params.data.contest.teams[1].score;
      }
      else {
        this.contestLocalCopy.teams[1].score = 0;
      }
      this.contestLocalCopy.teams[1].adminScoreAddition = 0;
    }

    var contestName;
    if (this.params.data.mode === 'edit') {
      contestName = this.params.data.contest.name.long;
    }
    else {
      contestName = this.client.translate('CONTEST_NAME_LONG', {
        'team0': this.contestLocalCopy.teams[0].name,
        'team1': this.contestLocalCopy.teams[1].name,
        'subject': this.contestLocalCopy.subject
      });
    }

    this.client.openPage('SetContestAdminPage',
      {
        'contestLocalCopy': this.contestLocalCopy,
        'mode': this.params.data.mode,
        'title': this.title,
        'contestName': contestName
      });
  }

  endDateSelected(dateSelection) {
    //Set the end date at the end of this day (e.g. 23:59:59.999)
    this.contestLocalCopy.endDate = dateSelection.epochLocal + this.currentTimeOnlyInMilliseconds;
  }

  getMaxEndDate() {
    if (!this.client.session.isAdmin) {
      //Allow extending by the maximum end date option in the list
      var endOption = this.client.settings['newContest'].endOptions[this.endOptionKeys[this.endOptionKeys.length - 1]];
      return this.nowWithoutTimeEpoch + this.currentTimeOnlyInMilliseconds + (endOption.number * endOption.msecMultiplier);
    }
    else {
      //Unlimited
      return null;
    }
  }

  subjectFocus() {
    if (!this.readOnlySubjectAlerted && this.contestLocalCopy.type.id === 'systemTrivia') {
      this.readOnlySubjectAlerted = true;
      alertService.alert({
        'type': 'SERVER_ERROR_SUBJECT_DISABLED_IN_SYSTEM_TRIVIA'
      });
    }
  }
}
