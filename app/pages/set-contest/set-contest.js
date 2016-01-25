var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_1 = require('ionic/ionic');
var core_1 = require('angular2/core');
var common_1 = require('angular2/common');
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
var paymentService = require('../../providers/payments');
var popupService = require('../../providers/popup');
var SetContestPage = (function () {
    function SetContestPage(params, formBuilder) {
        this.client = client_1.Client.getInstance();
        this.params = params;
        this.form = formBuilder.group({
            nonMatchingTeams: formBuilder.group({
                team0: ['', common_1.Validators.required],
                team1: ['', common_1.Validators.required]
            }, { validator: this.nonMatchingTeams })
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
        this.client.events.subscribe('topTeamer:someEvent...', function (eventData) {
        });
    }
    SetContestPage.prototype.onPageWillEnter = function () {
        var _this = this;
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
                'teams': [{ "name": null, "score": 0 }, { "name": null, "score": 0 }]
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
                inappbilling.getProductDetails(function (products) {
                    //In android - the price already contains the symbol
                    _this.client.session.features.newContest.purchaseData.formattedCost = products[0].price;
                    _this.client.session.features.newContest.purchaseData.cost = products[0].price_amount_micros / 1000000;
                    _this.client.session.features.newContest.purchaseData.currency = products[0].price_currency_code;
                    _this.client.session.features.newContest.purchaseData.retrieved = true;
                    //-------------------------------------------------------------------------------------------------------------
                    //Retrieve unconsumed items - and checking if user has an unconsumed "new contest unlock key"
                    //-------------------------------------------------------------------------------------------------------------
                    inappbilling.getPurchases(function (unconsumedItems) {
                        if (unconsumedItems && unconsumedItems.length > 0) {
                            for (var i = 0; i < unconsumedItems.length; i++) {
                                if (unconsumedItems[i].productId === _this.client.session.features.newContest.purchaseData.productId) {
                                    processAndroidPurchase(unconsumedItems[i]);
                                    break;
                                }
                            }
                        }
                    }, function (error) {
                        FlurryAgent.myLogError("AndroidBillingError", "Error retrieving unconsumed items: " + error);
                    });
                }, function (msg) {
                    FlurryAgent.myLogError("AndroidBillingError", "Error getting product details: " + msg);
                }, $rootScope.session.features.newContest.purchaseData.productId);
            }
        }
        else {
            this.client.session.features.newContest.purchaseData.retrieved = true;
        }
        this.contestLocalCopy.totalParticipants = this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants;
        this.hideAdminInfo = true;
    };
    SetContestPage.prototype.retrieveUserQuestions = function () {
        var _this = this;
        var postData = { 'userQuestions': this.contestLocalCopy.userQuestions };
        this.client.serverPost('contests/getQuestions', postData).then(function (questions) {
            _this.contestLocalCopy.questions = { 'visibleCount': questions.length, 'list': questions };
        });
    };
    SetContestPage.prototype.getTitle = function () {
        switch (params.data.mode) {
            case 'add':
                return this.client.translate('NEW_CONTEST');
            case 'edit':
                return this.client.translate('EDIT_CONTEST');
            default:
                return this.client.translate('WHO_IS_SMARTER');
        }
    };
    SetContestPage.prototype.processAndroidPurchase = function (purchaseData) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var extraPurchaseData = {
                'actualCost': _this.client.session.features.newContest.purchaseData.cost,
                'actualCurrency': _this.client.session.features.newContest.purchaseData.currency,
                'featurePurchased': _this.client.session.features.newContest.name
            };
            paymentService.processPayment('android', purchaseData, extraPurchaseData).then(function (serverPurchaseData) {
                //TODO: ionic loading...
                inappbilling.consumePurchase(function (purchaseData) {
                    //TODO: hide ionic loading...
                    if (resolve) {
                        resolve(purchaseData);
                    }
                    paymentService.showPurchaseSuccess(serverPurchaseData);
                }, function (error) {
                    //TODO: hide ionic loading...
                    FlurryAgent.myLogError('AndroidBilling', 'Error consuming product: ' + error);
                    if (reject) {
                        reject();
                    }
                }, purchaseData.productId);
            });
        });
    };
    SetContestPage.prototype.buyNewContestUnlockKey = function (isMobile) {
        var _this = this;
        this.buyInProgress = true;
        paymentService.buy(this.client.session.features.newContest, isMobile.then(function (result) {
            switch (result.method) {
                case 'paypal':
                    location.replace(result.data.url);
                    break;
                case 'facebook':
                    if (result.data.status === 'completed') {
                        paymentService.processPayment(result.method, result.data, null).then(function (serverPurchaseData) {
                            //Update local assets
                            _this.buyInProgress = false;
                            paymentService.showPurchaseSuccess(serverPurchaseData);
                        }, function (error) {
                            _this.buyInProgress = false;
                        });
                    }
                    else if (result.data.status === 'initiated') {
                        //Payment might come later from server
                        popupService.alert({ 'type': "SERVER_ERROR_PURCHASE_IN_PROGRESS" });
                    }
                    else {
                        //Probably user canceled
                        _this.buyInProgress = false;
                    }
                    break;
                case 'android':
                    _this.processAndroidPurchase(result.data).then(function (data) {
                        _this.buyInProgress = false;
                    }, function (error) {
                        _this.buyInProgress = false;
                    });
                    break;
            }
        }, function (error) {
            _this.buyInProgress = false;
        }));
    };
    ;
    SetContestPage.prototype.toggleAdminInfo = function () {
        if (this.contestLocalCopy.teams[0].name && this.contestLocalCopy.teams[1].name) {
            this.hideAdminInfo = !this.hideAdminInfo;
        }
    };
    ;
    SetContestPage.prototype.getArrowDirection = function (stateClosed) {
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
    };
    SetContestPage.prototype.removeContest = function () {
        var _this = this;
        popupService.confirm('CONFIRM_REMOVE_TITLE', 'CONFIRM_REMOVE_TEMPLATE', { name: this.contestLocalCopy.name }).then(function () {
            contestsService.removeContest(_this.contestLocalCopy._id).then(function (data) {
                _this.client.nav.pop();
                _this.client.events.publish('topTeamer-contestRemoved', data);
            });
        });
    };
    SetContestPage.prototype.setContest = function () {
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
            this.contestLocalCopy.manualParticipants += this.contestLocalCopy.totalParticipants - (this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants);
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
    };
    SetContestPage.prototype.nonMatchingTeams = function (group) {
        var val;
        var valid = true;
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
        return { nonMatchingTeams: true };
    };
    SetContestPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/set-contest/set-contest.html'
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.NavParams !== 'undefined' && ionic_1.NavParams) === 'function' && _a) || Object, (typeof (_b = typeof core_1.FormBuilder !== 'undefined' && core_1.FormBuilder) === 'function' && _b) || Object])
    ], SetContestPage);
    return SetContestPage;
    var _a, _b;
})();
exports.SetContestPage = SetContestPage;
