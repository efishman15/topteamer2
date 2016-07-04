import {ContestPage} from '../pages/contest/contest';
import {ContestParticipantsPage} from '../pages/contest-participants/contest-participants';
import {ContestTypePage} from '../pages/contest-type/contest-type';
import {FacebookPostPage} from '../pages/facebook-post/facebook-post';
import {LeaderboardsPage} from '../pages/leaderboards/leaderboards';
import {LoginPage} from '../pages/login/login';
import {MainTabsPage} from '../pages/main-tabs/main-tabs';
import {MyContestsPage} from '../pages/my-contests/my-contests';
import {NewRankPage} from '../pages/new-rank/new-rank';
import {PurchaseSuccessPage} from '../pages/purchase-success/purchase-success';
import {QuestionEditorPage} from '../pages/question-editor/question-editor';
import {QuestionStatsPage} from '../pages/question-stats/question-stats';
import {QuizPage} from '../pages/quiz/quiz';
import {RunningContestsPage} from '../pages/running-contests/running-contests';
import {SearchQuestionsPage} from '../pages/search-questions/search-questions';
import {ServerPopupPage} from '../pages/server-popup/server-popup';
import {SetContestPage} from '../pages/set-contest/set-contest';
import {SetContestAdminPage} from '../pages/set-contest-admin/set-contest-admin';
import {SettingsPage} from '../pages/settings/settings';
import {SharePage} from '../pages/share/share';
import {SystemToolsPage} from '../pages/system-tools/system-tools';

//------------------------------------------------------
//-- get
//------------------------------------------------------
export let get = (className:string) => {

  switch (className) {

    case 'ContestPage':
      return <any>ContestPage;
    case 'ContestParticipantsPage':
      return <any>ContestParticipantsPage;
    case 'ContestTypePage':
      return <any>ContestTypePage;
    case 'FacebookPostPage':
      return <any>FacebookPostPage
    case 'LeaderboardsPage':
      return <any>LeaderboardsPage;
    case 'LoginPage':
      return <any>LoginPage;
    case 'MainTabsPage':
      return <any>MainTabsPage;
    case 'MyContestsPage':
      return <any>MyContestsPage;
    case 'NewRankPage':
      return <any>NewRankPage;
    case 'PurchaseSuccessPage':
      return <any>PurchaseSuccessPage;
    case 'QuestionEditorPage':
      return <any>QuestionEditorPage;
    case 'QuestionStatsPage':
      return <any>QuestionStatsPage;
    case 'QuizPage':
      return <any>QuizPage;
    case 'RunningContestsPage':
      return <any>RunningContestsPage;
    case 'SearchQuestionsPage':
      return <any>SearchQuestionsPage;
    case 'ServerPopupPage':
      return <any>ServerPopupPage;
    case 'SetContestPage':
      return <any>SetContestPage;
    case 'SetContestAdminPage':
      return <any>SetContestAdminPage;
    case 'SettingsPage':
      return <any>SettingsPage;
    case 'SharePage':
      return <any>SharePage;
    case 'SystemToolsPage':
      return <any>SystemToolsPage;
  }
}

