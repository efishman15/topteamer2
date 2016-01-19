import {Page, NavParams,Events} from 'ionic/ionic';
import {AnimationListener} from '../../directives/animation-listener/animation-listener'
import {TransitionListener} from '../../directives/transition-listener/transition-listener'
import {Client} from '../../providers/client';
import * as SoundService from '../../providers/sound';

@Page({
  templateUrl: 'build/pages/quiz/quiz.html',
  directives: [AnimationListener, TransitionListener]
})

export class QuizPage {

  client:Client;
  contestId:string;
  source:string;
  quizData:Object;
  questionHistory:Array<Object> = [];
  correctButtonName:string;
  events: Events;

  constructor(params:NavParams, events: Events) {
    this.client = Client.getInstance();
    this.contestId = params.data.contestId;
    this.source = params.data.source;
    this.events = events;
  }

  onPageDidEnter() {
    this.startQuiz();
  }

  startQuiz() {
    FlurryAgent.logEvent('quiz/' + this.source + '/started');
    var postData = {'contestId': this.contestId};
    this.client.serverPost('quiz/start', postData).then((data) => {
      this.quizData = data.quiz;
      this.quizData.currentQuestion.answered = false;

      if (this.quizData.reviewMode && this.quizData.reviewMode.reason) {
        //TODO: show alert about review mode
        //PopupService.alert($translate.instant($scope.quiz.reviewMode.reason));
      }

      for (var i = 0; i < data.quiz.totalQuestions; i++) {
        this.questionHistory.push({"score": this.client.settings.quiz.questions.score[i]});
      }

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

        SoundService.play('audio/click_ok');
      }
      else {
        FlurryAgent.logEvent('quiz/question' + (this.quizData.currentQuestionIndex + 1) + "/answered/incorrect");
        SoundService.play("audio/click_wrong");
        correctAnswerId = data.question.correctAnswerId;
        this.quizData.currentQuestion.answers[answerId].answeredCorrectly = false;
        setTimeout(() => {
          this.quizData.currentQuestion.answers[data.question.correctAnswerId].correct = true;
        }, 3000)
      }

      this.correctButtonName = "buttonAnswer" + correctAnswerId;

    });
  }

  nextQuestion() {

    this.client.serverPost('quiz/nextQuestion').then((data) => {

      this.quizData = data;
      this.quizData.currentQuestion.answered = false;
      this.quizData.currentQuestion.doAnimation = true; //Animation end will trigger quiz proceed

      //TODO: drawQuizProgress();

      FlurryAgent.logEvent("quiz/gotQuestion" + (this.quizData.currentQuestionIndex + 1));
    });
  }

  questionTransitionEnd() {
    if (this.quizData && this.quizData.currentQuestion) {
      this.quizData.currentQuestion.doAnimation = false; //Animation end will trigger quiz proceed
    }
  }

  buttonAnimationEnded(event: Event) {

    if (this.quizData.xpProgress && this.quizData.xpProgress.addition > 0) {
      //TODO: XpService.addXp($scope.quiz.xpProgress, $scope.quizProceed);
    }

    if (this.correctButtonName === event.srcElement.name && (!this.quizData.xpProgress || !this.quizData.xpProgress.rankChanged)) {
      this.quizProceed();
    }
  };

  quizProceed() {
    if (this.quizData.finished) {

      //TODO: drawQuizProgress();
      this.client.session.score += this.quizData.results.data.score;

      FlurryAgent.logEvent('quiz/finished',
        {
          'score': '' + this.quizData.results.data.score,
          'title': this.quizData.results.data.title,
          'message': this.quizData.results.data.message
        });

      this.events.publish('topTeamer:quizFinished', this.quizData.results)

    }
    else {
      this.nextQuestion();
    }
  }
}
