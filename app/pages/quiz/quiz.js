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
var animation_listener_1 = require('../../directives/animation-listener/animation-listener');
var transition_listener_1 = require('../../directives/transition-listener/transition-listener');
var question_stats_1 = require('../../pages/question-stats/question-stats');
var question_editor_1 = require('../../pages/question-editor/question-editor');
var new_rank_1 = require('../../pages/new-rank/new-rank');
var client_1 = require('../../providers/client');
var quizService = require('../../providers/quiz');
var soundService = require('../../providers/sound');
var shareService = require('../../providers/share');
var alertService = require('../../providers/alert');
var objects_1 = require('../../objects/objects');
var QuizPage = (function () {
    function QuizPage(params) {
        this.questionHistory = [];
        this.pageInitiated = false;
        this.quizStarted = false;
        this.client = client_1.Client.getInstance();
        this.params = params;
    }
    QuizPage.prototype.ngOnInit = function () {
        this.init();
    };
    QuizPage.prototype.onPageWillEnter = function () {
        this.client.logEvent('page/quiz', { 'contestId': this.params.data.contest._id });
    };
    QuizPage.prototype.onPageDidEnter = function () {
        //onPageDidEnter occurs for the first time - BEFORE - ngOnInit - merging into a single 'private' init method
        if (this.quizStarted) {
            return;
        }
        this.init();
        this.contestId = this.params.data.contest._id;
        this.startQuiz();
    };
    QuizPage.prototype.init = function () {
        if (this.pageInitiated) {
            return;
        }
        this.quizCanvas = document.getElementById('quizCanvas');
        this.quizContext = this.quizCanvas.getContext('2d');
        this.pageInitiated = true;
    };
    QuizPage.prototype.startQuiz = function () {
        var _this = this;
        this.client.logEvent('quiz/started', {
            'source': this.params.data.source,
            'typeId': this.params.data.contest.type.id
        });
        quizService.start(this.contestId).then(function (data) {
            _this.quizStarted = true;
            _this.quizData = data.quiz;
            _this.quizData.currentQuestion.answered = false;
            for (var i = 0; i < data.quiz.totalQuestions; i++) {
                var questionItemInHistory = new objects_1.QuizQuestion(_this.client.settings.quiz.questions.score[i]);
                _this.questionHistory.push(questionItemInHistory);
            }
            _this.drawQuizProgress();
            if (_this.quizData.reviewMode && _this.quizData.reviewMode.reason) {
                alertService.alert(_this.client.translate(_this.quizData.reviewMode.reason));
            }
        }, function (err) {
            //IonicBug - wait for the prev alert to be fully dismissed
            setTimeout(function () {
                _this.client.nav.pop();
            }, 1000);
        });
    };
    QuizPage.prototype.submitAnswer = function (answerId) {
        var _this = this;
        this.quizData.currentQuestion.answered = true;
        quizService.answer(answerId, this.questionHistory[this.quizData.currentQuestionIndex].hintUsed, this.questionHistory[this.quizData.currentQuestionIndex].answerUsed).then(function (data) {
            var correctAnswerId;
            _this.questionHistory[_this.quizData.currentQuestionIndex].answered = data.question.correct;
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
                _this.client.logEvent('quiz/question' + (_this.quizData.currentQuestionIndex + 1) + '/answered/correct');
                correctAnswerId = answerId;
                _this.quizData.currentQuestion.answers[answerId].answeredCorrectly = true;
                soundService.play('audio/click_ok');
            }
            else {
                _this.client.logEvent('quiz/question' + (_this.quizData.currentQuestionIndex + 1) + '/answered/incorrect');
                soundService.play('audio/click_wrong');
                correctAnswerId = data.question.correctAnswerId;
                _this.quizData.currentQuestion.answers[answerId].answeredCorrectly = false;
                setTimeout(function () {
                    _this.quizData.currentQuestion.answers[data.question.correctAnswerId].correct = true;
                }, _this.client.settings.quiz.question.wrongAnswerMillisecondsDelay);
            }
            _this.correctButtonName = 'buttonAnswer' + correctAnswerId;
        }, function (err) {
            switch (err.type) {
                case 'SERVER_ERROR_SESSION_EXPIRED_DURING_QUIZ':
                    _this.startQuiz();
                    break;
                case 'SERVER_ERROR_GENERAL':
                    _this.client.nav.pop();
                    break;
            }
        });
    };
    QuizPage.prototype.nextQuestion = function () {
        var _this = this;
        quizService.nextQuestion().then(function (data) {
            _this.quizData = data;
            _this.quizData.currentQuestion.answered = false;
            _this.quizData.currentQuestion.doAnimation = true; //Animation end will trigger quiz proceed
            _this.drawQuizProgress();
            _this.client.logEvent('quiz/gotQuestion' + (_this.quizData.currentQuestionIndex + 1));
        });
    };
    QuizPage.prototype.questionTransitionEnd = function () {
        if (this.quizData && this.quizData.currentQuestion) {
            this.quizData.currentQuestion.doAnimation = false; //Animation end will trigger quiz proceed
        }
    };
    QuizPage.prototype.buttonAnimationEnded = function (event) {
        var _this = this;
        if (this.quizData.xpProgress && this.quizData.xpProgress.addition > 0) {
            this.client.addXp(this.quizData.xpProgress).then(function () {
                if (_this.correctButtonName === event.srcElement['name']) {
                    if (!_this.quizData.xpProgress.rankChanged) {
                        _this.quizProceed();
                    }
                    else {
                        var modal = ionic_angular_1.Modal.create(new_rank_1.NewRankPage, {
                            'xpProgress': _this.quizData.xpProgress
                        });
                        modal.onDismiss(function (okPressed) {
                            _this.quizProceed();
                        });
                        _this.client.nav.present(modal);
                    }
                }
            });
        }
        else if (this.correctButtonName === event.srcElement['name']) {
            this.quizProceed();
        }
    };
    QuizPage.prototype.quizProceed = function () {
        var _this = this;
        if (this.quizData.finished) {
            this.drawQuizProgress();
            this.client.session.score += this.quizData.results.data.score;
            this.client.logEvent('quiz/finished', {
                'score': '' + this.quizData.results.data.score,
                'title': this.quizData.results.data.title,
                'message': this.quizData.results.data.message
            });
            //Give enough time to draw the circle progress of the last question
            setTimeout(function () {
                _this.client.nav.pop().then(function () {
                    _this.client.events.publish('topTeamer:quizFinished', _this.quizData.results);
                    //For next time if view remains cached
                    _this.quizStarted = false;
                });
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
                    questionChart = JSON.parse(JSON.stringify(this.client.settings.charts.questionStats.dataSource));
                    questionChart.data = [];
                    var roundedCorrectRatio = Math.round(this.quizData.currentQuestion.correctRatio * 100) / 100;
                    var chartData = [
                        {
                            'label': this.client.translate('ANSWERED_CORRECT'),
                            'value': roundedCorrectRatio
                        },
                        {
                            'label': this.client.translate('ANSWERED_INCORRECT'),
                            'value': 1 - roundedCorrectRatio
                        },
                    ];
                    if (this.client.currentLanguage.direction === 'ltr') {
                        questionChart.data.push(chartData[0]);
                        questionChart.data.push(chartData[1]);
                        questionChart.chart.paletteColors = this.client.settings.charts.questionStats.colors.correct + ',' + this.client.settings.charts.questionStats.colors.incorrect;
                    }
                    else {
                        questionChart.data.push(chartData[1]);
                        questionChart.data.push(chartData[0]);
                        questionChart.chart.paletteColors = this.client.settings.charts.questionStats.colors.incorrect + ',' + this.client.settings.charts.questionStats.colors.correct;
                    }
                }
                var modal = ionic_angular_1.Modal.create(question_stats_1.QuestionStatsPage, {
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
    QuizPage.prototype.drawQuizProgress = function () {
        this.quizCanvas.width = this.quizCanvas.clientWidth;
        //Draw connecting line
        this.quizContext.beginPath();
        this.quizContext.moveTo(0, this.client.settings.quiz.canvas.circle.radius.outer + this.client.settings.quiz.canvas.size.topOffset);
        this.quizContext.lineTo(this.quizCanvas.width, this.client.settings.quiz.canvas.circle.radius.outer + this.client.settings.quiz.canvas.size.topOffset);
        this.quizContext.lineWidth = this.client.settings.quiz.canvas.line.width;
        this.quizContext.strokeStyle = this.client.settings.quiz.canvas.line.color;
        this.quizContext.stroke();
        this.quizContext.fill();
        this.quizContext.closePath();
        //Set the initial X to draw
        var currentX;
        if (this.client.currentLanguage.direction === 'ltr') {
            currentX = this.client.settings.quiz.canvas.circle.radius.outer;
        }
        else {
            currentX = this.quizCanvas.width - this.client.settings.quiz.canvas.circle.radius.outer;
        }
        this.currentQuestionCircle = null;
        //Calculate the space between the circles depending on the number of questions
        var circleOffsets = (this.quizCanvas.width - this.quizData.totalQuestions * this.client.settings.quiz.canvas.circle.radius.outer * 2) / (this.quizData.totalQuestions - 1);
        for (var i = 0; i < this.quizData.totalQuestions; i++) {
            if (i === this.quizData.currentQuestionIndex && this.questionHistory[i].answered == undefined) {
                //--------------------------------------------------------------------//
                // Current question (to be answered)
                //--------------------------------------------------------------------//
                //Current circle is clickable to get question stats
                this.currentQuestionCircle = {
                    'top': this.client.settings.quiz.canvas.size.topOffset,
                    'left': currentX - this.client.settings.quiz.canvas.circle.radius.outer,
                    'bottom': this.client.settings.quiz.canvas.size.topOffset + 2 * this.client.settings.quiz.canvas.circle.radius.outer,
                    'right': currentX + this.client.settings.quiz.canvas.circle.radius.outer
                };
                //Current question has statistics about success ratio
                if (this.quizData.currentQuestion.correctRatio || this.quizData.currentQuestion.correctRatio === 0) {
                    //Draw the outer circle
                    this.drawQuestionCircle(currentX, this.client.settings.quiz.canvas.circle.radius.outer, this.client.settings.quiz.canvas.circle.states.current.stats.outerColor);
                    if (this.quizData.currentQuestion.correctRatio === 1) {
                        //Draw full correct ratio (in the inner circle - partial arc)
                        this.drawQuestionCircle(currentX, this.client.settings.quiz.canvas.circle.radius.inner, this.client.settings.quiz.canvas.circle.states.previous.correct.innerColor, -Math.PI / 2, Math.PI * 2 - Math.PI / 2, false);
                    }
                    else if (this.quizData.currentQuestion.correctRatio === 0) {
                        //Draw full incorrect ratio (in the inner circle - partial arc)
                        this.drawQuestionCircle(currentX, this.client.settings.quiz.canvas.circle.radius.inner, this.client.settings.quiz.canvas.circle.states.previous.incorrect.innerColor, -Math.PI / 2, Math.PI * 2 - Math.PI / 2, false);
                    }
                    else {
                        this.drawQuestionCircle(currentX, this.client.settings.quiz.canvas.circle.radius.inner, this.client.settings.quiz.canvas.circle.states.previous.correct.innerColor, -Math.PI / 2, this.quizData.currentQuestion.correctRatio * Math.PI * 2 - Math.PI / 2, false);
                        this.drawQuestionCircle(currentX, this.client.settings.quiz.canvas.circle.radius.inner, this.client.settings.quiz.canvas.circle.states.previous.incorrect.innerColor, this.quizData.currentQuestion.correctRatio * Math.PI * 2 - Math.PI / 2, -Math.PI / 2, false);
                    }
                }
                else {
                    //Draw the "current" circle using the "noStats" state
                    this.drawQuestionState(currentX, this.client.settings.quiz.canvas.circle.states.current.noStats);
                }
            }
            else if (i > this.quizData.currentQuestionIndex && this.questionHistory[i].answered == undefined) {
                //--------------------------------------------------------------------//
                // Next Question - not reached yet
                //--------------------------------------------------------------------//
                this.drawQuestionState(currentX, this.client.settings.quiz.canvas.circle.states.next);
            }
            else {
                //--------------------------------------------------------------------//
                // Previous Question - already answered
                //--------------------------------------------------------------------//
                //Draw correct/incorrect for answered
                if (this.questionHistory[i].answered != undefined) {
                    if (this.questionHistory[i].answered) {
                        this.drawQuestionState(currentX, this.client.settings.quiz.canvas.circle.states.previous.correct);
                    }
                    else {
                        this.drawQuestionState(currentX, this.client.settings.quiz.canvas.circle.states.previous.incorrect);
                    }
                }
            }
            //--------------------------------------------------------------------//
            // Move the X offset to the next circle
            //--------------------------------------------------------------------//
            if (this.client.currentLanguage.direction === 'ltr') {
                if (i < this.quizData.totalQuestions - 1) {
                    currentX += circleOffsets + this.client.settings.quiz.canvas.circle.radius.outer * 2;
                }
                else {
                    currentX = this.quizCanvas.width - this.client.settings.quiz.canvas.circle.radius.outer;
                }
            }
            else {
                if (i < this.quizData.totalQuestions - 1) {
                    currentX = currentX - circleOffsets - (this.client.settings.quiz.canvas.circle.radius.outer * 2);
                }
                else {
                    currentX = this.client.settings.quiz.canvas.circle.radius.outer;
                }
            }
        }
        this.drawQuizScores();
    };
    QuizPage.prototype.drawQuestionCircle = function (x, radius, color, startAngle, endAngle, counterClockwise) {
        if (startAngle == undefined) {
            startAngle = 0;
        }
        if (endAngle == undefined) {
            endAngle = Math.PI * 2;
        }
        if (counterClockwise == undefined) {
            counterClockwise = false;
        }
        this.quizContext.beginPath();
        this.quizContext.fillStyle = color;
        this.quizContext.moveTo(x, this.client.settings.quiz.canvas.circle.radius.outer + this.client.settings.quiz.canvas.size.topOffset);
        this.quizContext.arc(x, this.client.settings.quiz.canvas.circle.radius.outer + this.client.settings.quiz.canvas.size.topOffset, radius, startAngle, endAngle, counterClockwise);
        this.quizContext.fill();
        this.quizContext.closePath();
    };
    QuizPage.prototype.drawQuestionState = function (x, state) {
        this.drawQuestionCircle(x, this.client.settings.quiz.canvas.circle.radius.outer, state.outerColor);
        if (state.innerColor) {
            this.drawQuestionCircle(x, this.client.settings.quiz.canvas.circle.radius.inner, state.innerColor);
        }
        if (state.text) {
            this.quizContext.beginPath();
            this.quizContext.fillStyle = state.textFillStyle;
            this.quizContext.font = this.client.settings.quiz.canvas.font.signs;
            var textWidth = this.quizContext.measureText(state.text).width;
            this.quizContext.fillText(state.text, x + (textWidth / 2), this.client.settings.quiz.canvas.size.topSignOffset);
            this.quizContext.closePath();
        }
    };
    QuizPage.prototype.clearQuizScores = function () {
        this.quizContext.beginPath();
        this.quizContext.clearRect(0, 0, this.quizCanvas.width, this.client.settings.quiz.canvas.scores.size.top);
        this.quizContext.closePath();
    };
    QuizPage.prototype.clearQuizProgress = function () {
        this.quizContext.beginPath();
        this.quizContext.clearRect(0, 0, this.quizCanvas.width, this.quizCanvas.height);
        this.quizContext.closePath();
    };
    QuizPage.prototype.drawQuizScores = function () {
        this.clearQuizScores();
        var currentX;
        if (this.client.currentLanguage.direction === 'ltr') {
            currentX = this.client.settings.quiz.canvas.circle.radius.outer;
        }
        else {
            currentX = this.quizCanvas.width - this.client.settings.quiz.canvas.circle.radius.outer;
        }
        var circleOffsets = (this.quizCanvas.width - this.quizData.totalQuestions * this.client.settings.quiz.canvas.circle.radius.outer * 2) / (this.quizData.totalQuestions - 1);
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
            var scoreColor = this.client.settings.quiz.canvas.scores.colors.default;
            if (this.questionHistory[i].answered && !this.questionHistory[i].answerUsed) {
                scoreColor = this.client.settings.quiz.canvas.scores.colors.correct;
            }
            //Draw the score at the top of the circle
            this.quizContext.beginPath();
            this.quizContext.fillStyle = scoreColor;
            this.quizContext.font = this.client.settings.quiz.canvas.font.scores;
            this.quizContext.fillText(questionScore, currentX + textWidth / 2, this.client.settings.quiz.canvas.scores.size.top);
            this.quizContext.closePath();
            if (this.client.currentLanguage.direction === 'ltr') {
                if (i < this.quizData.totalQuestions - 1) {
                    currentX += circleOffsets + this.client.settings.quiz.canvas.circle.radius.outer * 2;
                }
                else {
                    currentX = this.quizCanvas.width - this.client.settings.quiz.canvas.circle.radius.outer;
                }
            }
            else {
                if (i < this.quizData.totalQuestions - 1) {
                    currentX = currentX - circleOffsets - (this.client.settings.quiz.canvas.circle.radius.outer * 2);
                }
                else {
                    currentX = this.client.settings.quiz.canvas.circle.radius.outer;
                }
            }
        }
    };
    QuizPage.prototype.openQuestionEditor = function () {
        var _this = this;
        var question = {
            '_id': this.quizData.currentQuestion._id,
            'text': this.quizData.currentQuestion.text,
            'answers': []
        };
        for (var i = 0; i < this.quizData.currentQuestion.answers.length; i++) {
            question.answers[this.quizData.currentQuestion.answers[i].originalIndex] = this.quizData.currentQuestion.answers[i].text;
        }
        var modal = ionic_angular_1.Modal.create(question_editor_1.QuestionEditorPage, { 'question': question, 'mode': 'edit' });
        modal.onDismiss(function (result) {
            if (!result) {
                return;
            }
            quizService.setQuestionByAdmin(result.question).then(function () {
                _this.quizData.currentQuestion.text = result.question.text;
                for (var i = 0; i < result.question.answers.length; i++) {
                    _this.quizData.currentQuestion.answers[i].text = result.question.answers[_this.quizData.currentQuestion.answers[i].originalIndex];
                }
            });
        });
        this.client.nav.present(modal);
    };
    QuizPage.prototype.share = function () {
        shareService.share('quiz-fab', this.params.data.contest);
    };
    QuizPage.prototype.onResize = function () {
        this.clearQuizProgress();
        this.drawQuizProgress();
    };
    QuizPage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/quiz/quiz.html',
            directives: [animation_listener_1.AnimationListener, transition_listener_1.TransitionListener]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavParams])
    ], QuizPage);
    return QuizPage;
})();
exports.QuizPage = QuizPage;
//# sourceMappingURL=quiz.js.map