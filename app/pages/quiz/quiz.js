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
var transition_end_1 = require('../../directives/transition-end/transition-end');
var inner_html_1 = require('../../components/inner-html/inner-html');
var client_1 = require('../../providers/client');
var QuizPage = (function () {
    function QuizPage(params, dynamicComponentLoader, elementRef) {
        this.dynamicComponentLoader = dynamicComponentLoader;
        this.elementRef = elementRef;
        this.client = client_1.Client.getInstance();
        this.contestId = params.data.contestId;
        this.source = params.data.source;
    }
    QuizPage.prototype.questionTransitionEnd = function () {
        console.log('questionTransitionEnd');
    };
    QuizPage.prototype.onPageDidEnter = function () {
        this.startQuiz();
    };
    QuizPage.prototype.startQuiz = function () {
        var _this = this;
        FlurryAgent.logEvent('quiz/' + this.source + '/started');
        var postData = { 'contestId': this.contestId };
        this.client.serverPost('quiz/start', postData).then(function (data) {
            _this.quizData = data.quiz;
            _this.quizData.currentQuestion.answered = false;
            if (_this.quizData.reviewMode && _this.quizData.reviewMode.reason) {
            }
            var questionHtml = '<inner-html>' + _this.quizData.currentQuestion.text + '</inner-html>';
            var QuestionTextComponent = (function () {
                function QuestionTextComponent() {
                }
                QuestionTextComponent = __decorate([
                    core_1.Component({ selector: 'question-text-component' }),
                    core_1.View({ questionHtml: questionHtml, directives: [inner_html_1.InnerHtmlComponent] }), 
                    __metadata('design:paramtypes', [])
                ], QuestionTextComponent);
                return QuestionTextComponent;
            })();
            ;
            _this.dynamicComponentLoader.loadIntoLocation(QuestionTextComponent, _this.elementRef, 'questionText');
            for (var i = 0; i < _this.quizData.currentQuestion.answers.length; i++) {
                var answerHtml = '<inner-html>' + _this.quizData.currentQuestion.answers[i].text + '</inner-html>';
                var AnswerTextComponent = (function () {
                    function AnswerTextComponent() {
                    }
                    AnswerTextComponent = __decorate([
                        core_1.Component({ selector: 'answer-text-component' }),
                        core_1.View({ answerHtml: answerHtml, directives: [inner_html_1.InnerHtmlComponent] }), 
                        __metadata('design:paramtypes', [])
                    ], AnswerTextComponent);
                    return AnswerTextComponent;
                })();
                ;
                _this.dynamicComponentLoader.loadIntoLocation(AnswerTextComponent, _this.elementRef, 'answerText' + i);
            }
        });
    };
    QuizPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/quiz/quiz.html',
            directives: [transition_end_1.TransitionEndDirective, inner_html_1.InnerHtmlComponent]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.NavParams !== 'undefined' && ionic_1.NavParams) === 'function' && _a) || Object, core_1.DynamicComponentLoader, core_1.ElementRef])
    ], QuizPage);
    return QuizPage;
    var _a;
})();
exports.QuizPage = QuizPage;
