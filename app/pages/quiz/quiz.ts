import {Page, NavParams} from 'ionic/ionic';
import {Component, View, DynamicComponentLoader,ElementRef} from 'angular2/core';
import {TransitionEndDirective} from '../../directives/transition-end/transition-end'
import {InnerHtmlComponent} from '../../components/inner-html/inner-html'
import {Client} from '../../providers/client';

@Page({
  templateUrl: 'build/pages/quiz/quiz.html',
  directives: [TransitionEndDirective,InnerHtmlComponent]
})

export class QuizPage {

  dynamicComponentLoader: DynamicComponentLoader;
  elementRef: ElementRef;

  client:Client;
  contestId:string;
  source: string;
  quizData:Object;

  constructor(params:NavParams, dynamicComponentLoader: DynamicComponentLoader, elementRef: ElementRef) {
    this.dynamicComponentLoader = dynamicComponentLoader;
    this.elementRef = elementRef;

    this.client = Client.getInstance();
    this.contestId = params.data.contestId;
    this.source = params.data.source;
  }

  questionTransitionEnd() {
    console.log('questionTransitionEnd');
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

      var questionHtml = '<inner-html>' + this.quizData.currentQuestion.text + '</inner-html>';
      @Component({ selector: 'question-text-component' })
      @View({ questionHtml , directives: [InnerHtmlComponent] })
      class QuestionTextComponent {};
      this.dynamicComponentLoader.loadIntoLocation(QuestionTextComponent, this.elementRef,'questionText');

      for(var i=0; i<this.quizData.currentQuestion.answers.length; i++) {
        var answerHtml = '<inner-html>' + this.quizData.currentQuestion.answers[i].text + '</inner-html>';
        @Component({ selector: 'answer-text-component' })
        @View({ answerHtml , directives: [InnerHtmlComponent] })
        class AnswerTextComponent {};
        this.dynamicComponentLoader.loadIntoLocation(AnswerTextComponent, this.elementRef,'answerText' + i);
      }
    });
  }
}
