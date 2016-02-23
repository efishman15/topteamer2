import {Page,NavParams,ViewController} from 'ionic/ionic';
import {Client} from '../../providers/client';
import * as contestsService from '../../providers/contests';
import * as alertService from '../../providers/alert';

@Page({
  templateUrl: 'build/pages/search-questions/search-questions.html'
})
export class SearchQuestionsPage {

  client:Client;
  viewController: ViewController;
  currentQuestions: Array<Object>;
  searchText:String;
  questions: Array<Object>;

  constructor(params:NavParams, viewController: ViewController) {
    this.client = Client.getInstance();
    this.viewController = viewController;
    this.currentQuestions = params.data.currentQuestions;
    this.searchText = '';
  }

  onPageWillEnter() {
    FlurryAgent.logEvent('page/searchQuestions');
  }

  search(event) {

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

    contestsService.searchMyQuestions(this.searchText, existingQuestionIds).then ((questionsResult) => {
      this.questions = questionsResult;
    });

  }

  dismiss(applyChanges) {
    var result;
    if (applyChanges) {

      //Find how many selected
      var selectedCount = 0
      for (var i = 0; i < this.questions.length; i++) {
        if (this.questions[i].checked) {
          selectedCount++;
        }
      }

      //Check if max reached together with the current questions in the contest
      if (selectedCount > 0 && this.currentQuestions.visibleCount + selectedCount > this.client.settings.newContest.privateQuestions.max) {
        alertService.alert(this.client.translate('MAX_USER_QUESTIONS_REACHED', {max: this.client.settings.newContest.privateQuestions.max}))
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

  }
}
