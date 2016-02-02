var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_1 = require("ionic-framework/ionic");
var animation_listener_1 = require('../../directives/animation-listener/animation-listener');
var transition_listener_1 = require('../../directives/transition-listener/transition-listener');
var question_stats_1 = require('../../pages/question-stats/question-stats');
var client_1 = require('../../providers/client');
var soundService = require('../../providers/sound');
var alertService = require('../../providers/alert');
var QuizPage = (function () {
    function QuizPage(params) {
        this.questionHistory = [];
        this.imgCorrectSrc = 'images/correct.png';
        this.imgErrorSrc = 'images/error.png';
        this.imgQuestionInfoSrc = 'images/info_question.png';
        //Hash map - each item's key is the img.src and the value is an object like this:
        // loaded: true/false
        // drawRequests: array of drawRequest objects that each contain:
        //img, x, y, width, height
        this.drawImageQueue = {};
        this.client = client_1.Client.getInstance();
        this.params = params;
    }
    QuizPage.prototype.ngOnInit = function () {
        this.contestId = this.params.data.contestId;
        this.source = this.params.data.source;
        this.quizCanvas = document.getElementById('quizCanvas');
        this.quizContext = this.quizCanvas.getContext('2d');
        this.quizContext.font = this.client.settings.quiz.canvas.font;
        this.initDrawImageQueue(this.imgCorrectSrc);
        this.initDrawImageQueue(this.imgErrorSrc);
        this.initDrawImageQueue(this.imgQuestionInfoSrc);
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
                alertService.alert(_this.quizData.reviewMode.reason);
            }
            for (var i = 0; i < data.quiz.totalQuestions; i++) {
                _this.questionHistory.push({ 'score': _this.client.settings.quiz.questions.score[i] });
            }
            _this.drawQuizProgress();
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
                soundService.play('audio/click_ok');
            }
            else {
                FlurryAgent.logEvent('quiz/question' + (_this.quizData.currentQuestionIndex + 1) + '/answered/incorrect');
                soundService.play('audio/click_wrong');
                correctAnswerId = data.question.correctAnswerId;
                _this.quizData.currentQuestion.answers[answerId].answeredCorrectly = false;
                setTimeout(function () {
                    _this.quizData.currentQuestion.answers[data.question.correctAnswerId].correct = true;
                }, 3000);
            }
            _this.correctButtonName = 'buttonAnswer' + correctAnswerId;
        });
    };
    QuizPage.prototype.nextQuestion = function () {
        var _this = this;
        this.client.serverPost('quiz/nextQuestion').then(function (data) {
            _this.quizData = data;
            _this.quizData.currentQuestion.answered = false;
            _this.quizData.currentQuestion.doAnimation = true; //Animation end will trigger quiz proceed
            _this.drawQuizProgress();
            FlurryAgent.logEvent('quiz/gotQuestion' + (_this.quizData.currentQuestionIndex + 1));
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
        var _this = this;
        if (this.quizData.finished) {
            this.drawQuizProgress();
            this.client.session.score += this.quizData.results.data.score;
            FlurryAgent.logEvent('quiz/finished', {
                'score': '' + this.quizData.results.data.score,
                'title': this.quizData.results.data.title,
                'message': this.quizData.results.data.message
            });
            //Give enough time to draw the circle progress of the last question
            setTimeout(function () {
                _this.client.events.publish('topTeamer:quizFinished', _this.quizData.results);
            }, 1000);
        }
        else {
            this.nextQuestion();
        }
    };
    QuizPage.prototype.canvasClick = function (event) {
        var _this = this;
        if (this.currentQuestionCircle &&
            event.offsetX <= this.currentQuestionCircle.right &&
            event.offsetX >= this.currentQuestionCircle.left &&
            event.offsetY >= this.currentQuestionCircle.top &&
            event.offsetY <= this.currentQuestionCircle.bottom) {
            if (this.quizData.currentQuestion.correctRatio ||
                this.quizData.currentQuestion.correctRatio === 0 ||
                this.quizData.currentQuestion.wikipediaHint ||
                this.quizData.currentQuestion.wikipediaAnswer) {
                var questionChart;
                if (this.quizData.currentQuestion.correctRatio ||
                    this.quizData.currentQuestion.correctRatio === 0) {
                    questionChart = JSON.parse(JSON.stringify(this.client.settings.charts.questionStats));
                    questionChart.chart.caption = this.client.translate('QUESTION_STATS_CHART_CAPTION');
                    questionChart.chart.paletteColors = this.client.settings.quiz.canvas.correctRatioColor + ',' + this.client.settings.quiz.canvas.incorrectRatioColor;
                    questionChart.data = [];
                    questionChart.data.push({
                        'label': this.client.translate('ANSWERED_CORRECT'),
                        'value': this.quizData.currentQuestion.correctRatio
                    });
                    questionChart.data.push({
                        'label': this.client.translate('ANSWERED_INCORRECT'),
                        'value': (1 - this.quizData.currentQuestion.correctRatio)
                    });
                }
                var modal = ionic_1.Modal.create(question_stats_1.QuestionStatsPage, {
                    'question': this.quizData.currentQuestion,
                    'chartDataSource': questionChart
                });
                modal.onDismiss(function (action) {
                    switch (action) {
                        case 'hint':
                            _this.questionHistory[_this.quizData.currentQuestionIndex].hintUsed = true;
                            _this.questionHistory[_this.quizData.currentQuestionIndex].score = _this.client.settings.quiz.questions.score[_this.quizData.currentQuestionIndex] - _this.quizData.currentQuestion.hintCost;
                            _this.drawQuizScores();
                            window.open(_this.client.currentLanguage.wiki + _this.quizData.currentQuestion.wikipediaHint, '_system', 'location=yes');
                            break;
                        case 'answer':
                            _this.questionHistory[_this.quizData.currentQuestionIndex].answerUsed = true;
                            _this.questionHistory[_this.quizData.currentQuestionIndex].score = _this.client.settings.quiz.questions.score[_this.quizData.currentQuestionIndex] - _this.quizData.currentQuestion.answerCost;
                            _this.drawQuizScores();
                            window.open(_this.client.currentLanguage.wiki + _this.quizData.currentQuestion.wikipediaAnswer, '_system', 'location=yes');
                            break;
                    }
                });
                this.client.nav.present(modal);
            }
        }
    };
    QuizPage.prototype.processDrawImageRequests = function (imgSrc) {
        this.drawImageQueue[imgSrc].loaded = true;
        while (this.drawImageQueue[imgSrc].drawRequests.length > 0) {
            var drawRequest = this.drawImageQueue[imgSrc].drawRequests.pop();
            this.quizContext.drawImage(this.drawImageQueue[imgSrc].img, drawRequest.x, drawRequest.y, drawRequest.width, drawRequest.height);
        }
    };
    QuizPage.prototype.initDrawImageQueue = function (src) {
        var _this = this;
        var img = document.createElement('img');
        this.drawImageQueue[src] = { 'img': img, 'loaded': false, 'drawRequests': [] };
        img.onload = function () {
            _this.processDrawImageRequests(src);
        };
        img.src = src;
    };
    QuizPage.prototype.drawImageAsync = function (imgSrc, x, y, width, height) {
        //If image loaded - draw right away
        if (this.drawImageQueue[imgSrc].loaded) {
            this.quizContext.drawImage(this.drawImageQueue[imgSrc].img, x, y, width, height);
            return;
        }
        var drawRequest = {
            'x': x,
            'y': y,
            'width': width,
            'height': height
        };
        //Add request to queue
        this.drawImageQueue[imgSrc].drawRequests.push(drawRequest);
    };
    QuizPage.prototype.drawQuizProgress = function () {
        this.quizCanvas.width = this.quizCanvas.clientWidth;
        this.quizContext.beginPath();
        this.quizContext.moveTo(0, this.client.settings.quiz.canvas.radius + this.client.settings.quiz.canvas.topOffset);
        this.quizContext.lineTo(this.quizCanvas.width, this.client.settings.quiz.canvas.radius + this.client.settings.quiz.canvas.topOffset);
        this.quizContext.lineWidth = this.client.settings.quiz.canvas.lineWidth;
        // set line color
        this.quizContext.strokeStyle = this.client.settings.quiz.canvas.inactiveColor;
        this.quizContext.stroke();
        this.quizContext.fill();
        this.quizContext.closePath();
        var currentX;
        if (this.client.currentLanguage.direction === 'ltr') {
            currentX = this.client.settings.quiz.canvas.radius;
        }
        else {
            currentX = this.quizCanvas.width - this.client.settings.quiz.canvas.radius;
        }
        this.currentQuestionCircle = null;
        var circleOffsets = (this.quizCanvas.width - this.quizData.totalQuestions * this.client.settings.quiz.canvas.radius * 2) / (this.quizData.totalQuestions - 1);
        for (var i = 0; i < this.quizData.totalQuestions; i++) {
            if (i === this.quizData.currentQuestionIndex) {
                //Question has no statistics about success ratio
                this.quizContext.beginPath();
                this.quizContext.fillStyle = this.client.settings.quiz.canvas.activeColor;
                this.quizContext.arc(currentX, this.client.settings.quiz.canvas.radius + this.client.settings.quiz.canvas.topOffset, this.client.settings.quiz.canvas.radius, 0, Math.PI * 2, false);
                this.quizContext.fill();
                this.quizContext.closePath();
                this.currentQuestionCircle = {
                    'top': this.client.settings.quiz.canvas.topOffset,
                    'left': currentX - this.client.settings.quiz.canvas.radius,
                    'bottom': this.client.settings.quiz.canvas.topOffset + 2 * this.client.settings.quiz.canvas.radius,
                    'right': currentX + this.client.settings.quiz.canvas.radius
                };
                //Current question has statistics about success ratio
                if (this.quizData.currentQuestion.correctRatio || this.quizData.currentQuestion.correctRatio == 0) {
                    //Draw the correct ratio
                    if (this.quizData.currentQuestion.correctRatio > 0) {
                        this.quizContext.beginPath();
                        this.quizContext.moveTo(currentX, this.client.settings.quiz.canvas.radius + this.client.settings.quiz.canvas.topOffset);
                        this.quizContext.fillStyle = this.client.settings.quiz.canvas.correctRatioColor;
                        this.quizContext.arc(currentX, this.client.settings.quiz.canvas.radius + this.client.settings.quiz.canvas.topOffset, this.client.settings.quiz.canvas.pieChartRadius, 0, -this.quizData.currentQuestion.correctRatio * Math.PI * 2, true);
                        this.quizContext.fill();
                        this.quizContext.closePath();
                    }
                    //Draw the incorrect ratio
                    if (this.quizData.currentQuestion.correctRatio < 1) {
                        this.quizContext.beginPath();
                        this.quizContext.moveTo(currentX, this.client.settings.quiz.canvas.radius + this.client.settings.quiz.canvas.topOffset);
                        this.quizContext.fillStyle = this.client.settings.quiz.canvas.incorrectRatioColor;
                        this.quizContext.arc(currentX, this.client.settings.quiz.canvas.radius + this.client.settings.quiz.canvas.topOffset, this.client.settings.quiz.canvas.pieChartRadius, -this.quizData.currentQuestion.correctRatio * Math.PI * 2, Math.PI * 2, true);
                        this.quizContext.fill();
                        this.quizContext.closePath();
                    }
                }
                else {
                    //Question has no stats - draw an info icon inside to make user press
                    this.drawImageAsync(this.imgQuestionInfoSrc, currentX - this.client.settings.quiz.canvas.pieChartRadius, this.client.settings.quiz.canvas.topOffset + this.client.settings.quiz.canvas.radius - this.client.settings.quiz.canvas.pieChartRadius, this.client.settings.quiz.canvas.pieChartRadius * 2, this.client.settings.quiz.canvas.pieChartRadius * 2);
                }
            }
            else {
                this.quizContext.beginPath();
                this.quizContext.fillStyle = this.client.settings.quiz.canvas.inactiveColor;
                this.quizContext.arc(currentX, this.client.settings.quiz.canvas.radius + this.client.settings.quiz.canvas.topOffset, this.client.settings.quiz.canvas.radius, 0, Math.PI * 2, false);
                this.quizContext.fill();
                this.quizContext.closePath();
            }
            //Draw correct/incorrect for answered
            if (this.questionHistory[i].answer != null) {
                if (this.questionHistory[i].answer) {
                    this.drawImageAsync(this.imgCorrectSrc, currentX - this.client.settings.quiz.canvas.radius, this.client.settings.quiz.canvas.topOffset, this.client.settings.quiz.canvas.radius * 2, this.client.settings.quiz.canvas.radius * 2);
                }
                else {
                    this.drawImageAsync(this.imgErrorSrc, currentX - this.client.settings.quiz.canvas.radius, this.client.settings.quiz.canvas.topOffset, this.client.settings.quiz.canvas.radius * 2, this.client.settings.quiz.canvas.radius * 2);
                }
            }
            if (this.client.currentLanguage.direction === 'ltr') {
                if (i < this.quizData.totalQuestions - 1) {
                    currentX += circleOffsets + this.client.settings.quiz.canvas.radius * 2;
                }
                else {
                    currentX = this.quizCanvas.width - this.client.settings.quiz.canvas.radius;
                }
            }
            else {
                if (i < this.quizData.totalQuestions - 1) {
                    currentX = currentX - circleOffsets - (this.client.settings.quiz.canvas.radius * 2);
                }
                else {
                    currentX = this.client.settings.quiz.canvas.radius;
                }
            }
        }
        this.drawQuizScores();
    };
    ;
    QuizPage.prototype.clearQuizScores = function () {
        this.quizContext.beginPath();
        this.quizContext.clearRect(0, 0, this.quizCanvas.width, this.client.settings.quiz.canvas.scores.top);
        this.quizContext.closePath();
    };
    QuizPage.prototype.drawQuizScores = function () {
        this.clearQuizScores();
        var currentX;
        if (this.client.currentLanguage.direction === 'ltr') {
            currentX = this.client.settings.quiz.canvas.radius;
        }
        else {
            currentX = this.quizCanvas.width - this.client.settings.quiz.canvas.radius;
        }
        var circleOffsets = (this.quizCanvas.width - this.quizData.totalQuestions * this.client.settings.quiz.canvas.radius * 2) / (this.quizData.totalQuestions - 1);
        for (var i = 0; i < this.quizData.totalQuestions; i++) {
            var questionScore;
            if (!this.quizData.reviewMode) {
                questionScore = '' + this.questionHistory[i].score;
            }
            else {
                questionScore = '';
            }
            //Draw question score
            var textWidth = this.quizContext.measureText(questionScore).width;
            var scoreColor = this.client.settings.quiz.canvas.inactiveColor;
            if (this.questionHistory[i].answer && !this.questionHistory[i].answerUsed) {
                scoreColor = this.client.settings.quiz.canvas.correctRatioColor;
            }
            //Draw the score at the top of the circle
            this.quizContext.beginPath();
            this.quizContext.fillStyle = scoreColor;
            this.quizContext.fillText(questionScore, currentX + textWidth / 2, this.client.settings.quiz.canvas.scores.top);
            this.quizContext.closePath();
            if (this.client.currentLanguage.direction === 'ltr') {
                if (i < this.quizData.totalQuestions - 1) {
                    currentX += circleOffsets + this.client.settings.quiz.canvas.radius * 2;
                }
                else {
                    currentX = this.quizCanvas.width - this.client.settings.quiz.canvas.radius;
                }
            }
            else {
                if (i < this.quizData.totalQuestions - 1) {
                    currentX = currentX - circleOffsets - (this.client.settings.quiz.canvas.radius * 2);
                }
                else {
                    currentX = this.client.settings.quiz.canvas.radius;
                }
            }
        }
    };
    ;
    QuizPage = __decorate([
        ionic_1.Page({
            templateUrl: 'build/pages/quiz/quiz.html',
            directives: [animation_listener_1.AnimationListener, transition_listener_1.TransitionListener]
        }), 
        __metadata('design:paramtypes', [ionic_1.NavParams])
    ], QuizPage);
    return QuizPage;
})();
exports.QuizPage = QuizPage;
