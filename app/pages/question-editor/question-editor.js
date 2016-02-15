var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var common_1 = require('angular2/common');
var ionic_1 = require('ionic/ionic');
var client_1 = require('../../providers/client');
var QuestionEditorPage = (function () {
    function QuestionEditorPage(params, viewController, formBuilder) {
        this.client = client_1.Client.getInstance();
        this.viewController = viewController;
        this.mode = params.data.mode;
        if (this.mode === 'add') {
            this.title = this.client.translate('NEW_QUESTION');
            this.question = { 'text': null, answers: [null, null, null, null] };
        }
        else if (this.mode === 'edit') {
            this.title = this.client.translate('EDIT_QUESTION');
            this.question = params.data.question;
        }
        //TODO: figure out how to pass to the html5 text area object a dynamic max length so input further input will be disabled
        this.questionControl = new common_1.Control('', common_1.Validators.compose([common_1.Validators.required, common_1.Validators.maxLength(this.client.settings.quiz.question.maxLength)]));
        this.answer0Control = new common_1.Control('', common_1.Validators.compose([common_1.Validators.required, common_1.Validators.maxLength(this.client.settings.quiz.question.answer.maxLength)]));
        this.answer1Control = new common_1.Control('', common_1.Validators.compose([common_1.Validators.required, common_1.Validators.maxLength(this.client.settings.quiz.question.answer.maxLength)]));
        this.answer2Control = new common_1.Control('', common_1.Validators.compose([common_1.Validators.required, common_1.Validators.maxLength(this.client.settings.quiz.question.answer.maxLength)]));
        this.answer3Control = new common_1.Control('', common_1.Validators.compose([common_1.Validators.required, common_1.Validators.maxLength(this.client.settings.quiz.question.answer.maxLength)]));
        this.questionEditorForm = formBuilder.group({
            questionControl: this.questionControl,
            answer0Control: this.answer0Control,
            answer1Control: this.answer1Control,
            answer2Control: this.answer2Control,
            answer3Control: this.answer3Control
        });
        this.currentQuestions = params.data.currentQuestions;
    }
    QuestionEditorPage.prototype.onPageWillEnter = function () {
        this.submitted = false;
    };
    QuestionEditorPage.prototype.dismiss = function (applyChanges) {
        this.submitted = true;
        if (!this.questionEditorForm.valid) {
            return;
        }
        var result;
        if (applyChanges) {
            //Check for duplicate questions
            if (this.currentQuestions && this.currentQuestions.list && this.currentQuestions.list.length > 0) {
                //Check if question exists
                var matchCount = 0;
                for (var i = 0; i < this.currentQuestions.list.length; i++) {
                    if (this.question.text.trim() === this.currentQuestions.list[i].text.trim()) {
                        matchCount++;
                    }
                }
                if ((!this.question._id && matchCount > 0) || matchCount > 1) {
                    //In edit mode - the question text will be matched at least once - to the current question in the list
                    this.questionError = this.client.translate('SERVER_ERROR_QUESTION_ALREADY_EXISTS_MESSAGE');
                    return;
                }
            }
            //Check for duplicate answers
            var answersHash;
            for (var i = 0; i < this.question.answers.length; i++) {
                if (!answersHash) {
                    answersHash = {};
                    answersHash[this.question.answers[i]] = true;
                }
                else if (answersHash[this.question.answers[i]]) {
                    this.answersError = this.client.translate('SERVER_ERROR_ENTER_DIFFERENT_ANSWERS_MESSAGE');
                    return;
                }
                else {
                    answersHash[this.question.answers[i]] = true;
                }
            }
            result = { 'question': this.question, 'mode': this.mode };
        }
        this.viewController.dismiss(result);
    };
    QuestionEditorPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/question-editor/question-editor.html'
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.NavParams !== 'undefined' && ionic_1.NavParams) === 'function' && _a) || Object, (typeof (_b = typeof ionic_1.ViewController !== 'undefined' && ionic_1.ViewController) === 'function' && _b) || Object, common_1.FormBuilder])
    ], QuestionEditorPage);
    return QuestionEditorPage;
    var _a, _b;
})();
exports.QuestionEditorPage = QuestionEditorPage;
