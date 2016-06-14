import {Form, FormBuilder, Control, ControlGroup, Validators,FORM_DIRECTIVES} from '@angular/common';
import {Component,ViewChild} from '@angular/core';
import {NavParams,ViewController,Content} from 'ionic-angular';
import {Client} from '../../providers/client';
import {Question,Questions} from '../../objects/objects';

@Component({
  templateUrl: 'build/pages/question-editor/question-editor.html'

})
export class QuestionEditorPage {

  @ViewChild(Content) content: Content;

  client:Client;
  question:Question;
  mode:String;
  viewController:ViewController;
  title:String;
  currentQuestions: Questions;
  questionError:String;
  answersError:String;
  submitted:Boolean;

  questionEditorForm: ControlGroup;
  questionControl: Control;
  answer0Control: Control;
  answer1Control: Control;
  answer2Control: Control;
  answer3Control: Control;
  fieldInFocus: number;

  constructor(params:NavParams, viewController: ViewController, formBuilder:FormBuilder) {
    this.client = Client.getInstance();
    this.viewController = viewController;
    this.fieldInFocus = -1;

    this.mode = params.data.mode;

    if (this.mode === 'add') {
      this.title = this.client.translate('NEW_QUESTION');
      this.question =  new Question();
    }
    else if (this.mode === 'edit') {
      this.title = this.client.translate('EDIT_QUESTION');
      this.question = params.data.question;
    }

    this.questionControl = new Control('', Validators.compose([Validators.required, Validators.maxLength(this.client.settings.quiz.question.maxLength)]));
    this.answer0Control = new Control('', Validators.compose([Validators.required, Validators.maxLength(this.client.settings.quiz.question.answer.maxLength)]));
    this.answer1Control = new Control('', Validators.compose([Validators.required, Validators.maxLength(this.client.settings.quiz.question.answer.maxLength)]));
    this.answer2Control = new Control('', Validators.compose([Validators.required, Validators.maxLength(this.client.settings.quiz.question.answer.maxLength)]));
    this.answer3Control = new Control('', Validators.compose([Validators.required, Validators.maxLength(this.client.settings.quiz.question.answer.maxLength)]));

    this.questionEditorForm = formBuilder.group({
      questionControl: this.questionControl,
      answer0Control: this.answer0Control,
      answer1Control: this.answer1Control,
      answer2Control: this.answer2Control,
      answer3Control: this.answer3Control
    });

    this.currentQuestions = params.data.currentQuestions;
    this.submitted = false;

  }

  //The only life cycle eve currently called in modals
  ngAfterViewInit() {

    var eventData = {'mode' : this.mode};
    if (this.mode === 'edit') {
      eventData['questionId'] = this.question._id;
    }
    this.client.logEvent('page/questionEditor', eventData);

  }

  dismiss(applyChanges) {

    this.client.logEvent('question/' + (applyChanges ? 'set' : 'cancel'));
    var result;
    if (applyChanges) {

      this.submitted = true;
      if (!this.questionEditorForm.valid) {
        return;
      }

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
      for (var i=0; i<this.question.answers.length; i++) {
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

      result = {'question': this.question, 'mode': this.mode}
    }

    this.viewController.dismiss(result);
  }

  inputFocus(fieldId: number) {
    this.fieldInFocus = fieldId;
  }

  inputBlur() {
    this.fieldInFocus = -1;
  }
}
