var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_angular_1 = require('ionic-angular');
var common_1 = require('angular2/common');
var date_picker_1 = require('../../components/date-picker/date-picker');
var client_1 = require('../../providers/client');
var contest_1 = require('../../pages/contest/contest');
var question_editor_1 = require('../../pages/question-editor/question-editor');
var search_questions_1 = require('../../pages/search-questions/search-questions');
var mobile_share_1 = require('../../pages/mobile-share/mobile-share');
var contestsService = require('../../providers/contests');
var paymentService = require('../../providers/payments');
var alertService = require('../../providers/alert');
var shareService = require('../../providers/share');
var SetContestPage = (function () {
    function SetContestPage(params, formBuilder) {
        var _this = this;
        this.client = client_1.Client.getInstance();
        this.params = params;
        this.endOptionKeys = Object.keys(this.client.settings.newContest.endOptions);
        this.team0 = new common_1.Control('', common_1.Validators.required);
        this.team1 = new common_1.Control('', common_1.Validators.required);
        this.contestForm = formBuilder.group({
            team0: this.team0,
            team1: this.team1
        }, { validator: this.matchingTeamsValidator });
        //Start date is today, end date is by default within 24 hours
        this.startDate = new Date();
        this.startDate.clearTime();
        this.endDate = new Date(this.startDate.getTime() + 1 * 24 * 60 * 60 * 1000);
        this.showRemoveContest = false;
        if (this.params.data.mode === 'edit') {
            this.contestLocalCopy = JSON.parse(JSON.stringify(this.params.data.contest));
            //Server stores in epoch - client uses real DATE objects
            this.contestLocalCopy.startDate = new Date(this.contestLocalCopy.startDate);
            this.contestLocalCopy.endDate = new Date(this.contestLocalCopy.endDate);
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
            this.contestLocalCopy = {
                'startDate': this.startDate,
                'endDate': this.endDate,
                'endOption': 'h24',
                'type': this.params.data.type,
                'participants': 0,
                'manualParticipants': 0,
                'manualRating': 0,
                'teams': [{ 'name': null, 'score': 0 }, { 'name': null, 'score': 0 }]
            };
            this.showStartDate = true;
            this.contestLocalCopy.questions = { 'visibleCount': 0, 'list': [] };
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
                    //Retrieve unconsumed items - and checking if user has an unconsumed 'new contest unlock key'
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
                        _this.client.logError('AndroidBillingError', 'Error retrieving unconsumed items: ' + error);
                    });
                }, function (msg) {
                    this.client.logError('AndroidBillingError', 'Error getting product details: ' + msg);
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
    SetContestPage.prototype.onPageWillEnter = function () {
        var eventData = { 'mode': this.params.data.mode };
        if (this.params.data.mode === 'edit') {
            eventData.contestId = this.params.data.contest._id;
        }
        this.client.logEvent('page/setContest', eventData);
        this.submitted = false;
    };
    SetContestPage.prototype.retrieveUserQuestions = function () {
        var _this = this;
        contestsService.getQuestions(this.contestLocalCopy.userQuestions).then(function (questions) {
            _this.contestLocalCopy.questions = { 'visibleCount': questions.length, 'list': questions };
        });
    };
    SetContestPage.prototype.getTitle = function () {
        switch (this.params.data.mode) {
            case 'add':
                return this.client.translate('NEW_CONTEST');
            case 'edit':
                return this.client.translate('EDIT_CONTEST');
            default:
                return this.client.translate('GAME_NAME');
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
                _this.client.showSpinner = true;
                inappbilling.consumePurchase(function (purchaseData) {
                    _this.client.showSpinner = false;
                    if (resolve) {
                        resolve(purchaseData);
                    }
                    paymentService.showPurchaseSuccess(serverPurchaseData);
                }, function (error) {
                    _this.client.showSpinner = false;
                    _this.client.logError('AndroidBilling', 'Error consuming product: ' + error);
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
                        alertService.alert({ 'type': 'SERVER_ERROR_PURCHASE_IN_PROGRESS' });
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
            this.showAdminInfo = !this.showAdminInfo;
        }
    };
    ;
    SetContestPage.prototype.getArrowDirection = function (stateClosed) {
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
    };
    SetContestPage.prototype.removeContest = function () {
        var _this = this;
        this.client.logEvent('contest/remove/click', { 'contestId': this.contestLocalCopy._id });
        alertService.confirm('CONFIRM_REMOVE_TITLE', 'CONFIRM_REMOVE_TEMPLATE', { name: this.contestLocalCopy.name }).then(function () {
            _this.client.logEvent('contest/removed', { 'contestId': _this.contestLocalCopy._id });
            contestsService.removeContest(_this.contestLocalCopy._id).then(function () {
                _this.client.events.publish('topTeamer:contestRemoved');
                setTimeout(function () {
                    _this.client.nav.popToRoot({ animate: false });
                }, 1000);
            });
        });
    };
    SetContestPage.prototype.userQuestionsMinimumCheck = function () {
        if (this.client.settings.newContest.privateQuestions.min === 1) {
            this.userQuestionsInvalid = this.client.translate('SERVER_ERROR_MINIMUM_USER_QUESTIONS_SINGLE_MESSAGE', { minimum: this.client.settings.newContest.privateQuestions.min });
        }
        else {
            this.userQuestionsInvalid = this.client.translate('SERVER_ERROR_MINIMUM_USER_QUESTIONS_SINGLE_MESSAGE', { minimum: this.client.settings.newContest.privateQuestions.min });
        }
        if (this.userQuestionsInvalid) {
            return true;
        }
        else {
            return false;
        }
    };
    SetContestPage.prototype.maxQuestionsReached = function () {
        return (this.contestLocalCopy.questions && this.contestLocalCopy.questions.visibleCount === this.client.settings.newContest.privateQuestions.max);
    };
    SetContestPage.prototype.openQuestionEditor = function (mode, question) {
        var _this = this;
        if (mode === "add") {
            if (this.maxQuestionsReached()) {
                alertService.alert(this.client.translate("MAX_USER_QUESTIONS_REACHED", { max: this.client.settings.newContest.privateQuestions.max }));
                return;
            }
        }
        var modal = ionic_angular_1.Modal.create(question_editor_1.QuestionEditorPage, { 'question': question, 'mode': mode, 'currentQuestions': this.contestLocalCopy.questions });
        modal.onDismiss(function (result) {
            if (!result) {
                return;
            }
            _this.userQuestionsInvalid = null;
            if (!result.question._id) {
                //New questions
                result.question._id = "new";
                _this.contestLocalCopy.questions.list.push(result.question);
                _this.contestLocalCopy.questions.visibleCount++;
            }
            else if (result.question._id !== "new") {
                //Set dirty flag for the question - so server will update it in the db
                result.question.isDirty = true;
            }
        });
        this.client.nav.present(modal);
    };
    SetContestPage.prototype.openSearchQuestions = function () {
        if (this.maxQuestionsReached()) {
            alertService.alert(this.client.translate('MAX_USER_QUESTIONS_REACHED', { max: this.client.settings.newContest.privateQuestions.max }));
            return;
        }
        var modal = ionic_angular_1.Modal.create(search_questions_1.SearchQuestionsPage, { 'currentQuestions': this.contestLocalCopy.questions });
        this.client.nav.present(modal);
    };
    SetContestPage.prototype.removeQuestion = function (index) {
        var _this = this;
        alertService.confirm('REMOVE_QUESTION', 'CONFIRM_REMOVE_QUESTION').then(function () {
            if (_this.contestLocalCopy.questions.list && index < _this.contestLocalCopy.questions.list.length) {
                if (_this.contestLocalCopy.questions.list[index]._id && _this.contestLocalCopy.questions.list[index]._id !== "new") {
                    //Question has an id in the database - logically remove
                    _this.contestLocalCopy.questions.list[index].deleted = true;
                }
                else {
                    //Question does not have an actual id in the database - physically remove
                    _this.contestLocalCopy.questions.list.splice(index, 1);
                }
                _this.contestLocalCopy.questions.visibleCount--;
            }
        });
    };
    ;
    SetContestPage.prototype.setContest = function () {
        var _this = this;
        this.client.logEvent('contest/set');
        this.submitted = true;
        if (!this.contestForm.valid) {
            return;
        }
        if (this.contestLocalCopy.type.id === 'userTrivia') {
            if (!this.contestLocalCopy.questions || this.contestLocalCopy.questions.visibleCount < this.client.settings.newContest.privateQuestions.min) {
                if (!this.userQuestionsMinimumCheck()) {
                    return;
                }
            }
        }
        //Tweak the manual participants
        if (this.contestLocalCopy.totalParticipants > this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants) {
            this.contestLocalCopy.manualParticipants += this.contestLocalCopy.totalParticipants - (this.contestLocalCopy.participants + this.contestLocalCopy.manualParticipants);
        }
        delete this.contestLocalCopy['totalParticipants'];
        delete this.contestLocalCopy['status'];
        //Server stores in epoch - client uses real DATE objects
        //Convert back to epoch before storing to server
        this.contestLocalCopy.startDate = this.contestLocalCopy.startDate.getTime();
        this.contestLocalCopy.endDate = this.contestLocalCopy.endDate.getTime();
        if (this.params.data.mode === 'add' || (this.params.data.mode === 'edit' && JSON.stringify(this.params.data.contest) != JSON.stringify(this.contestLocalCopy))) {
            this.contestLocalCopy.name = this.client.translate('CONTEST_NAME', {
                'team0': this.contestLocalCopy.teams[0].name,
                'team1': this.contestLocalCopy.teams[1].name,
                'type': this.client.translate(this.contestLocalCopy.type.name)
            });
            if (this.params.data.mode === 'edit' && this.contestLocalCopy.name !== this.params.data.contest.name) {
                this.contestNameChanged = true;
            }
            contestsService.setContest(this.contestLocalCopy, this.params.data.mode, this.contestNameChanged).then(function (contest) {
                _this.contestLocalCopy.startDate = new Date(_this.contestLocalCopy.startDate);
                _this.contestLocalCopy.endDate = new Date(_this.contestLocalCopy.endDate);
                //Report to Flurry
                var contestParams = {
                    'team0': _this.contestLocalCopy.teams[0].name,
                    'team1': _this.contestLocalCopy.teams[1].name,
                    'duration': _this.contestLocalCopy.endOption,
                    'questionsSource': _this.contestLocalCopy.questionsSource
                };
                if (_this.params.data.mode === 'add') {
                    _this.client.logEvent('contest/created', contestParams);
                    _this.client.events.publish('topTeamer:contestCreated', contest);
                    var options = { animate: false };
                    _this.client.nav.pop(options).then(function () {
                        if (!_this.client.user.clientInfo.mobile) {
                            //For web - no animation - the share screen will be on top with its animation
                            _this.client.nav.push(contest_1.ContestPage, { 'contest': contest }).then(function () {
                                shareService.share('newContestWebPopup', contest);
                            });
                        }
                        else {
                            //Mobile - open the share mobile modal - with one button - to share or skip
                            _this.client.nav.push(contest_1.ContestPage, { 'contest': contest }).then(function () {
                                var modal = ionic_angular_1.Modal.create(mobile_share_1.MobileSharePage, { 'contest': contest });
                                _this.client.nav.present(modal);
                            });
                        }
                    });
                }
                else {
                    _this.client.logEvent('contest/updated', contestParams);
                    _this.client.events.publish('topTeamer:contestUpdated', contest);
                    _this.client.nav.pop();
                }
            }, function (error) {
                _this.contestLocalCopy.startDate = new Date(_this.contestLocalCopy.startDate);
                _this.contestLocalCopy.endDate = new Date(_this.contestLocalCopy.endDate);
            });
        }
        else {
            this.client.nav.pop();
        }
    };
    SetContestPage.prototype.matchingTeamsValidator = function (group) {
        var val;
        var valid = true;
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
        return { matchingTeams: true };
    };
    //TODO: validate startDate<endDate
    SetContestPage.prototype.startDateSelected = function (dateSelection) {
        if (dateSelection.dateObject > this.contestLocalCopy.endDate) {
            return false;
        }
        this.contestLocalCopy.startDate = dateSelection.dateObject;
        return true;
    };
    SetContestPage.prototype.endDateSelected = function (dateSelection) {
        if (dateSelection.dateObject < this.contestLocalCopy.startDate) {
            return false;
        }
        this.contestLocalCopy.endDate = dateSelection.dateObject;
        return true;
    };
    SetContestPage.prototype.setDateLimits = function () {
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
    };
    SetContestPage.prototype.getMaxEndDate = function () {
        //Set the maximum end date according to the last end option in the list
        return new Date(this.contestLocalCopy.startDate.getTime() + this.client.settings.newContest.endOptions[this.endOptionKeys[this.endOptionKeys.length - 1]].msecMultiplier);
    };
    SetContestPage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/set-contest/set-contest.html',
            directives: [common_1.FORM_DIRECTIVES, date_picker_1.DatePickerComponent]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavParams, common_1.FormBuilder])
    ], SetContestPage);
    return SetContestPage;
})();
exports.SetContestPage = SetContestPage;
