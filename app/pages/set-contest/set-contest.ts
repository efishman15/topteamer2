import {Page, NavParams} from 'ionic/ionic';
import {ViewChild, Form, FormBuilder} from 'angular2/core';
import {Form, FormBuilder, Control, ControlGroup, Validators } from 'angular2/common';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as paymentService from '../../providers/payments';
import * as popupService from '../../providers/popup';

@Page({
  templateUrl: 'build/pages/set-contest/set-contest.html'
})

export class SetContestPage {

  client:Client;
  params:NavParams;

  minContestStart:Date;
  minContestEnd:Date;
  startDate:Date;
  endDate:Date;
  showRemoveContest:Boolean;
  contestLocalCopy:Object;
  showStartDate:Boolean;
  hideAdminInfo:Boolean;
  buyInProgress:Boolean;

  form:ControlGroup;

  constructor(params:NavParams, formBuilder:FormBuilder) {

    this.client = Client.getInstance();
    this.params = params;

    this.form = formBuilder.group({
      nonMatchingTeams: formBuilder.group({
        team0: ['', Validators.required],
        team1: ['', Validators.required]
      }, {validator: this.nonMatchingTeams})
    });


    //Start date is today, end date is by default within 24 hours
    this.startDate = new Date();
    this.startDate.clearTime();
    this.endDate = new Date(this.startDate.getTime() + 1 * 24 * 60 * 60 * 1000);

    if (this.client.session.isAdmin) {
      //Only Admins are allowed to set past dates
      this.minContestStart = this.startDate;
      this.minContestEnd = this.startDate;
    }
    else {
      var pastDate = new Date(1970, 0, 1, 0, 0, 0);
      this.minContestStart = pastDate;
      this.minContestEnd = pastDate;
    }

    this.showRemoveContest = false;

    this.client.events.subscribe('topTeamer:someEvent...', (eventData) => {
    });

  }

  onPageWillEnter() {

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
        'teams': [{"name": null, "score": 0}, {"name": null, "score": 0}]
      };
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
            //Retrieve unconsumed items - and checking if user has an unconsumed "new contest unlock key"
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
                FlurryAgent.myLogError("AndroidBillingError", "Error retrieving unconsumed items: " + error);
              });

          },
          function (msg) {
            FlurryAgent.myLogError("AndroidBillingError", "Error getting product details: " + msg);
          }, $rootScope.session.features.newContest.purchaseData.productId);
      }
    }
    else {
      this.client.session.features.newContest.purchaseData.retrieved = true;
    }

    this.contestLocalCopy.totalParticipants = this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants;
    this.hideAdminInfo = true;

  }

  retrieveUserQuestions() {
    var postData = {'userQuestions': this.contestLocalCopy.userQuestions};
    this.client.serverPost('contests/getQuestions', postData).then((questions) => {
      this.contestLocalCopy.questions = {'visibleCount': questions.length, 'list': questions};
    });
  }

  getTitle() {
    switch (params.data.mode) {
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
              popupService.alert({'type': "SERVER_ERROR_PURCHASE_IN_PROGRESS"});
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
      this.hideAdminInfo = !this.hideAdminInfo;
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

    popupService.confirm('CONFIRM_REMOVE_TITLE', 'CONFIRM_REMOVE_TEMPLATE', {name: this.contestLocalCopy.name}).then(() => {
      contestsService.removeContest(this.contestLocalCopy._id).then((data) => {
        this.client.nav.pop();
        this.client.events.publish('topTeamer-contestRemoved', data);
      })
    });
  }

  setContest() {

    if (this.contestLocalCopy.content.source === 'trivia' && this.contestLocalCopy.content.category.id === 'user') {
      if (!this.contestLocalCopy.questions || this.contestLocalCopy.questions.visibleCount < this.client.settings.newContest.privateQuestions.min) {
        if (!$scope.contestForm.userQuestions.$error) {
          $scope.contestForm.userQuestions.$error = {};
        }
        if ($rootScope.settings.newContest.privateQuestions.min === 1) {
          $scope.contestForm.userQuestions.$error["minimumQuestionsSingle"] = true;
        }
        else {
          $scope.contestForm.userQuestions.$error["minimumQuestionsPlural"] = true;
        }
        $scope.contestForm.userQuestions.$invalid = true;

        return;
      }
    }

    //Tweak the manual participants
    if (this.contestLocalCopy.totalParticipants > this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants) {
      this.contestLocalCopy.manualParticipants += this.contestLocalCopy.totalParticipants - (this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants)
    }

    delete this.contestLocalCopy["totalParticipants"];

    delete this.contestLocalCopy["status"];

    //Server stores in epoch - client uses real DATE objects
    //Convert back to epoch before storing to server
    this.contestLocalCopy.startDate = this.contestLocalCopy.startDate.getTime();
    this.contestLocalCopy.endDate = this.contestLocalCopy.endDate.getTime();

    if ($stateParams.mode === "add" || ($stateParams.mode === "edit" && JSON.stringify($stateParams.contest) != JSON.stringify(this.contestLocalCopy))) {

      this.contestLocalCopy.name = $translate.instant("FULL_CONTEST_NAME", {
        "team0": this.contestLocalCopy.teams[0].name,
        "team1": this.contestLocalCopy.teams[1].name
      });

      if ($stateParams.mode === "edit" && this.contestLocalCopy.name !== $stateParams.contest.name) {
        this.contestLocalCopy.nameChanged = true;
      }

      ContestsService.setContest(this.contestLocalCopy, $stateParams.mode, function (contest) {

        this.contestLocalCopy.startDate = new Date(this.contestLocalCopy.startDate);
        this.contestLocalCopy.endDate = new Date(this.contestLocalCopy.endDate);

        //Report to Flurry
        var contestParams = {
          "team0": this.contestLocalCopy.teams[0].name,
          "team1": this.contestLocalCopy.teams[1].name,
          "duration": this.contestLocalCopy.endOption,
          "questionsSource": this.contestLocalCopy.questionsSource
        };

        $rootScope.goBack();

        if ($stateParams.mode === "add") {
          FlurryAgent.logEvent("contest/created", contestParams);
          $rootScope.$broadcast("topTeamer-contestCreated", contest);
        }
        else {
          FlurryAgent.logEvent("contest/updated", contestParams);
          $rootScope.$broadcast("topTeamer-contestUpdated", contest);
        }

      }, function (status, error) {
        this.contestLocalCopy.startDate = new Date(this.contestLocalCopy.startDate);
        this.contestLocalCopy.endDate = new Date(this.contestLocalCopy.endDate);
      });
    }
    else {
      $rootScope.goBack();
    }

  }

  nonMatchingTeams(group:ControlGroup) {

    let val;
    let valid = true;

    for (name in group.controls) {
      if (val === undefined) {
        val = group.controls[name].value
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

    return {nonMatchingTeams: true};
  }
}

