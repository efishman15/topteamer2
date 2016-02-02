import {Page, NavParams,Modal} from "ionic-framework/ionic";
import {AnimationListener} from '../../directives/animation-listener/animation-listener'
import {TransitionListener} from '../../directives/transition-listener/transition-listener'
import {QuestionStatsPage} from '../../pages/question-stats/question-stats'
import {Client} from '../../providers/client';
import * as soundService from '../../providers/sound';
import * as alertService from '../../providers/alert';

@Page({
  templateUrl: 'build/pages/quiz/quiz.html',
  directives: [AnimationListener, TransitionListener]
})

export class QuizPage {

  client:Client;
  params:NavParams;
  contestId:string;
  source:string;
  quizData:Object;
  questionHistory:Array<Object> = [];
  correctButtonName:string;

  //Canvas vars
  quizCanvas:any;
  quizContext:any;
  currentQuestionCircle:any;
  questionChart:Object;
  imgCorrectSrc:String = 'images/correct.png';
  imgErrorSrc:String = 'images/error.png';
  imgQuestionInfoSrc:String = 'images/info_question.png';


  //Hash map - each item's key is the img.src and the value is an object like this:
  // loaded: true/false
  // drawRequests: array of drawRequest objects that each contain:
  //img, x, y, width, height
  drawImageQueue = {};

  constructor(params:NavParams) {
    this.client = Client.getInstance();
    this.params = params;
  }

  ngOnInit() {
    this.contestId = this.params.data.contestId;
    this.source = this.params.data.source;

    this.quizCanvas = document.getElementById('quizCanvas');
    this.quizContext = this.quizCanvas.getContext('2d');
    this.quizContext.font = this.client.settings.quiz.canvas.font;

    this.initDrawImageQueue(this.imgCorrectSrc);
    this.initDrawImageQueue(this.imgErrorSrc);
    this.initDrawImageQueue(this.imgQuestionInfoSrc);

    this.startQuiz();
  }

  startQuiz() {
    FlurryAgent.logEvent('quiz/' + this.source + '/started');
    var postData = {'contestId': this.contestId};
    this.client.serverPost('quiz/start', postData).then((data) => {
      this.quizData = data.quiz;
      this.quizData.currentQuestion.answered = false;

      if (this.quizData.reviewMode && this.quizData.reviewMode.reason) {
        alertService.alert(this.quizData.reviewMode.reason);
      }

      for (var i = 0; i < data.quiz.totalQuestions; i++) {
        this.questionHistory.push({'score': this.client.settings.quiz.questions.score[i]});
      }

      this.drawQuizProgress();

    });
  }

  submitAnswer(answerId) {

    this.quizData.currentQuestion.answered = true;

    //TODO: respond to server errors by going back and restarting quiz:
    //'SERVER_ERROR_SESSION_EXPIRED_DURING_QUIZ': {'next': startQuiz},
    //'SERVER_ERROR_GENERAL':

    var postData = {'id': answerId};
    if (this.questionHistory[this.quizData.currentQuestionIndex].hintUsed) {
      postData.hintUsed = this.questionHistory[this.quizData.currentQuestionIndex].hintUsed;
    }
    if (this.questionHistory[this.quizData.currentQuestionIndex].answerUsed) {
      postData.answerUsed = this.questionHistory[this.quizData.currentQuestionIndex].answerUsed;
    }

    this.client.serverPost('quiz/answer', postData).then((data) => {

      var correctAnswerId;

      this.questionHistory[this.quizData.currentQuestionIndex].answer = data.question.correct;

      if (data.results) {
        //Will get here when quiz is finished
        this.quizData.results = data.results;
      }

      //Rank might change during quiz - and feature might open
      if (data.features) {
        this.client.session.features = data.features;
      }

      if (data.xpProgress) {
        this.quizData.xpProgress = data.xpProgress;
      }
      else {
        this.quizData.xpProgress = null;
      }

      if (data.question.correct) {

        FlurryAgent.logEvent('quiz/question' + (this.quizData.currentQuestionIndex + 1) + '/answered/correct');

        correctAnswerId = answerId;
        this.quizData.currentQuestion.answers[answerId].answeredCorrectly = true;

        soundService.play('audio/click_ok');
      }
      else {
        FlurryAgent.logEvent('quiz/question' + (this.quizData.currentQuestionIndex + 1) + '/answered/incorrect');
        soundService.play('audio/click_wrong');
        correctAnswerId = data.question.correctAnswerId;
        this.quizData.currentQuestion.answers[answerId].answeredCorrectly = false;
        setTimeout(() => {
          this.quizData.currentQuestion.answers[data.question.correctAnswerId].correct = true;
        }, 3000)
      }

      this.correctButtonName = 'buttonAnswer' + correctAnswerId;

    });
  }

  nextQuestion() {

    this.client.serverPost('quiz/nextQuestion').then((data) => {

      this.quizData = data;
      this.quizData.currentQuestion.answered = false;
      this.quizData.currentQuestion.doAnimation = true; //Animation end will trigger quiz proceed

      this.drawQuizProgress();

      FlurryAgent.logEvent('quiz/gotQuestion' + (this.quizData.currentQuestionIndex + 1));
    });
  }

  questionTransitionEnd() {
    if (this.quizData && this.quizData.currentQuestion) {
      this.quizData.currentQuestion.doAnimation = false; //Animation end will trigger quiz proceed
    }
  }

  buttonAnimationEnded(event:Event) {

    if (this.quizData.xpProgress && this.quizData.xpProgress.addition > 0) {
      //TODO: XpService.addXp($scope.quiz.xpProgress, $scope.quizProceed);
    }

    if (this.correctButtonName === event.srcElement.name && (!this.quizData.xpProgress || !this.quizData.xpProgress.rankChanged)) {
      this.quizProceed();
    }
  };

  quizProceed() {
    if (this.quizData.finished) {

      this.drawQuizProgress();
      this.client.session.score += this.quizData.results.data.score;

      FlurryAgent.logEvent('quiz/finished',
        {
          'score': '' + this.quizData.results.data.score,
          'title': this.quizData.results.data.title,
          'message': this.quizData.results.data.message
        });

      //Give enough time to draw the circle progress of the last question
      setTimeout(() => {
        this.client.events.publish('topTeamer:quizFinished', this.quizData.results)
      }, 1000);

    }
    else {
      this.nextQuestion();
    }
  }

  canvasClick(event) {

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

        var modal = Modal.create(QuestionStatsPage, {
          'question': this.quizData.currentQuestion,
          'chartDataSource': questionChart
        });

        modal.onDismiss( (action) => {
          switch (action) {
            case 'hint':
              this.questionHistory[this.quizData.currentQuestionIndex].hintUsed = true;
              this.questionHistory[this.quizData.currentQuestionIndex].score = this.client.settings.quiz.questions.score[this.quizData.currentQuestionIndex] - this.quizData.currentQuestion.hintCost;
              this.drawQuizScores();
              window.open(this.client.currentLanguage.wiki + this.quizData.currentQuestion.wikipediaHint, '_system', 'location=yes');
              break;

            case 'answer':
              this.questionHistory[this.quizData.currentQuestionIndex].answerUsed = true;
              this.questionHistory[this.quizData.currentQuestionIndex].score = this.client.settings.quiz.questions.score[this.quizData.currentQuestionIndex] - this.quizData.currentQuestion.answerCost;
              this.drawQuizScores();
              window.open(this.client.currentLanguage.wiki + this.quizData.currentQuestion.wikipediaAnswer, '_system', 'location=yes');
              break;
          }
        });

        this.client.nav.present(modal);
      }
    }
  }

  processDrawImageRequests(imgSrc) {

    this.drawImageQueue[imgSrc].loaded = true;
    while (this.drawImageQueue[imgSrc].drawRequests.length > 0) {
      var drawRequest = this.drawImageQueue[imgSrc].drawRequests.pop();
      this.quizContext.drawImage(this.drawImageQueue[imgSrc].img, drawRequest.x, drawRequest.y, drawRequest.width, drawRequest.height);
    }
  }

  initDrawImageQueue(src) {

    var img = document.createElement('img');
    this.drawImageQueue[src] = {'img': img, 'loaded': false, 'drawRequests': []};

    img.onload = () => {
      this.processDrawImageRequests(src);
    }
    img.src = src;
  }

  drawImageAsync(imgSrc, x, y, width, height) {

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
    }

    //Add request to queue
    this.drawImageQueue[imgSrc].drawRequests.push(drawRequest);
  }

  drawQuizProgress() {

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

  }
  ;

  clearQuizScores() {
    this.quizContext.beginPath();
    this.quizContext.clearRect(0, 0, this.quizCanvas.width, this.client.settings.quiz.canvas.scores.top);
    this.quizContext.closePath();
  }

  drawQuizScores() {

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
  }
  ;

}
