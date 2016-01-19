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
var animation_listener_1 = require('../../directives/animation-listener/animation-listener');
var transition_listener_1 = require('../../directives/transition-listener/transition-listener');
var client_1 = require('../../providers/client');
var SoundService = require('../../providers/sound');
var QuizPage = (function () {
    function QuizPage(params, events) {
        this.questionHistory = [];
        this.client = client_1.Client.getInstance();
        this.contestId = params.data.contestId;
        this.source = params.data.source;
        this.events = events;
    }
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
            for (var i = 0; i < data.quiz.totalQuestions; i++) {
                _this.questionHistory.push({ "score": _this.client.settings.quiz.questions.score[i] });
            }
        });
    };
    QuizPage.prototype.submitAnswer = function (answerId) {
        var _this = this;
        this.quizData.currentQuestion.answered = true;
        //TODO: respond to server errors by going back and restarting quiz:
        //'SERVER_ERROR_SESSION_EXPIRED_DURING_QUIZ': {'next': startQuiz},
        //'SERVER_ERROR_GENERAL':
        var postData = { 'id': answerId };
        if (this.questionHistory[this.quizData.currentQuestionIndex].hintUsed) {
            postData.hintUsed = this.questionHistory[this.quizData.currentQuestionIndex].hintUsed;
        }
        if (this.questionHistory[this.quizData.currentQuestionIndex].answerUsed) {
            postData.answerUsed = this.questionHistory[this.quizData.currentQuestionIndex].answerUsed;
        }
        this.client.serverPost('quiz/answer', postData).then(function (data) {
            var correctAnswerId;
            _this.questionHistory[_this.quizData.currentQuestionIndex].answer = data.question.correct;
            if (data.results) {
                //Will get here when quiz is finished
                _this.quizData.results = data.results;
            }
            //Rank might change during quiz - and feature might open
            if (data.features) {
                _this.client.session.features = data.features;
            }
            if (data.xpProgress) {
                _this.quizData.xpProgress = data.xpProgress;
            }
            else {
                _this.quizData.xpProgress = null;
            }
            if (data.question.correct) {
                FlurryAgent.logEvent('quiz/question' + (_this.quizData.currentQuestionIndex + 1) + '/answered/correct');
                correctAnswerId = answerId;
                _this.quizData.currentQuestion.answers[answerId].answeredCorrectly = true;
                SoundService.play('audio/click_ok');
            }
            else {
                FlurryAgent.logEvent('quiz/question' + (_this.quizData.currentQuestionIndex + 1) + "/answered/incorrect");
                SoundService.play("audio/click_wrong");
                correctAnswerId = data.question.correctAnswerId;
                _this.quizData.currentQuestion.answers[answerId].answeredCorrectly = false;
                setTimeout(function () {
                    _this.quizData.currentQuestion.answers[data.question.correctAnswerId].correct = true;
                }, 3000);
            }
            _this.correctButtonName = "buttonAnswer" + correctAnswerId;
        });
    };
    QuizPage.prototype.nextQuestion = function () {
        var _this = this;
        this.client.serverPost('quiz/nextQuestion').then(function (data) {
            _this.quizData = data;
            _this.quizData.currentQuestion.answered = false;
            _this.quizData.currentQuestion.doAnimation = true; //Animation end will trigger quiz proceed
            //TODO: drawQuizProgress();
            FlurryAgent.logEvent("quiz/gotQuestion" + (_this.quizData.currentQuestionIndex + 1));
        });
    };
    QuizPage.prototype.questionTransitionEnd = function () {
        if (this.quizData && this.quizData.currentQuestion) {
            this.quizData.currentQuestion.doAnimation = false; //Animation end will trigger quiz proceed
        }
    };
    QuizPage.prototype.buttonAnimationEnded = function (event) {
        if (this.quizData.xpProgress && this.quizData.xpProgress.addition > 0) {
        }
        if (this.correctButtonName === event.srcElement.name && (!this.quizData.xpProgress || !this.quizData.xpProgress.rankChanged)) {
            this.quizProceed();
        }
    };
    ;
    QuizPage.prototype.quizProceed = function () {
        if (this.quizData.finished) {
            //TODO: drawQuizProgress();
            this.client.session.score += this.quizData.results.data.score;
            FlurryAgent.logEvent('quiz/finished', {
                'score': '' + this.quizData.results.data.score,
                'title': this.quizData.results.data.title,
                'message': this.quizData.results.data.message
            });
            this.events.publish('topTeamer:quizFinished', this.quizData.results);
        }
        else {
            this.nextQuestion();
        }
    };
    QuizPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/quiz/quiz.html',
            directives: [animation_listener_1.AnimationListener, transition_listener_1.TransitionListener]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.NavParams !== 'undefined' && ionic_1.NavParams) === 'function' && _a) || Object, (typeof (_b = typeof ionic_1.Events !== 'undefined' && ionic_1.Events) === 'function' && _b) || Object])
    ], QuizPage);
    return QuizPage;
    var _a, _b;
})();
exports.QuizPage = QuizPage;
