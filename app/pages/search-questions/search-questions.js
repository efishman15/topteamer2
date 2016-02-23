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
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
var alertService = require('../../providers/alert');
var SearchQuestionsPage = (function () {
    function SearchQuestionsPage(params, viewController) {
        this.client = client_1.Client.getInstance();
        this.viewController = viewController;
        this.currentQuestions = params.data.currentQuestions;
        this.searchText = '';
    }
    SearchQuestionsPage.prototype.onPageWillEnter = function () {
        FlurryAgent.logEvent('page/searchQuestions');
    };
    SearchQuestionsPage.prototype.search = function (event) {
        var _this = this;
        //Clear list if empty text
        if (!this.searchText || !(this.searchText.trim())) {
            this.questions = [];
            return;
        }
        var existingQuestionIds = [];
        if (this.currentQuestions && this.currentQuestions.visibleCount > 0) {
            for (var i = 0; i < this.currentQuestions.list.length; i++) {
                if (this.currentQuestions.list[i]._id && this.currentQuestions.list[i].deleted) {
                    existingQuestionIds.push(this.currentQuestions.list[i]._id);
                }
            }
        }
        contestsService.searchMyQuestions(this.searchText, existingQuestionIds).then(function (questionsResult) {
            _this.questions = questionsResult;
        });
    };
    SearchQuestionsPage.prototype.dismiss = function (applyChanges) {
        var result;
        if (applyChanges) {
            //Find how many selected
            var selectedCount = 0;
            for (var i = 0; i < this.questions.length; i++) {
                if (this.questions[i].checked) {
                    selectedCount++;
                }
            }
            //Check if max reached together with the current questions in the contest
            if (selectedCount > 0 && this.currentQuestions.visibleCount + selectedCount > this.client.settings.newContest.privateQuestions.max) {
                alertService.alert(this.client.translate('MAX_USER_QUESTIONS_REACHED', { max: this.client.settings.newContest.privateQuestions.max }));
                return;
            }
            for (var i = 0; i < this.questions.length; i++) {
                if (!this.questions[i].checked) {
                    continue;
                }
                var questionExist = false;
                for (var j = 0; j < this.currentQuestions.list.length; j++) {
                    //Check if question was marked as "deleted", and now re-instated
                    if (this.questions[i]._id === this.currentQuestions.list[j]._id && this.currentQuestions.list[j].deleted) {
                        this.currentQuestions.list[j].deleted = false;
                        this.currentQuestions.visibleCount++;
                        questionExist = true;
                        break;
                    }
                }
                if (!questionExist) {
                    this.currentQuestions.visibleCount++;
                    this.currentQuestions.list.push(JSON.parse(JSON.stringify(this.questions[i])));
                }
            }
        }
        this.viewController.dismiss();
    };
    SearchQuestionsPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/search-questions/search-questions.html'
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.NavParams !== 'undefined' && ionic_1.NavParams) === 'function' && _a) || Object, (typeof (_b = typeof ionic_1.ViewController !== 'undefined' && ionic_1.ViewController) === 'function' && _b) || Object])
    ], SearchQuestionsPage);
    return SearchQuestionsPage;
    var _a, _b;
})();
exports.SearchQuestionsPage = SearchQuestionsPage;
