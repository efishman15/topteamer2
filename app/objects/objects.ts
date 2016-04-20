export class Settings {
  general:GeneralSettings;
  facebook:FacebookSettings;
  quiz:QuizSettings;
  charts:ChartsSettings;
  platforms:Array<Object>;
  xpControl:XpControl;
  google:GoogleSettings;
  languages:Array<Language>;
  ui:Array<Array<Object>>;
}

export class GoogleSettings {
  gcm:GoogleGcmSettings;
}

export class GoogleGcmSettings {
  senderID:string;
}

export class XpControl {
  canvas:Size;
  radius:number;
  fillColor:string;
  lineWidth:number;
  fullLineColor:string;
  progressLineColor:string;
  textColor:string;
  font:XpControlFont;
}

export class XpControlFont {
  name:string;
  bold:boolean;
  d1:string;
  d2:string;
  d3:string;
}

export class GeneralSettings {
  webCanvasWidth:number;
  facebookFanPage:string;
}

export class FacebookSettings {
  friendsPermission:Array<string>;
}

export class QuizSettings {
  canvas:QuizCanvasSettings;
  question:QuizQuestionSettings;
  questions:QuizQuestionsSettings;
}

export class QuizQuestionsSettings {
  score:Array<number>;
}

export class QuizCanvasSettings {
  font: QuizCanvasFontSettings;
  scores:QuizCanvasScoresSettings;
  circle:QuizCanvasCircleSettings;
  size:QuizCanvasSizeSettings;
  line:QuizCanvasLineSettings;
}

export class QuizCanvasFontSettings {
  scores: string;
  signs: string;
}
export class QuizCanvasSizeSettings {
  width: number;
  height: number;
  topOffset: number;
  topSignOffset: number;
}

export class QuizCanvasScoresSettings {
  size: QuizCanvasScoresSizeSettings;
  colors: QuizCanvasScoresColorsSettings;
}

export  class QuizCanvasScoresSizeSettings {
  top: number;
}

export class QuizCanvasScoresColorsSettings {
  default: string;
  correct: string;
}

export class QuizCanvasCircleSettings {
  radius: QuizCanvasCircleRadiusSettings;
  states: QuizCanvasCircleStatesSettings;
}

export class QuizCanvasCircleRadiusSettings {
  inner: number;
  outer: number;
}

export class QuizCanvasCircleStateSettings {
  innerColor: string;
  outerColor: string;
  text: string;
  textFillStyle: string;
}

export class QuizCanvasLineSettings {
  color: string;
  width: number;
}

export class QuizCanvasCircleStatesSettings {
  previous: QuizCanvasCircleStatePreviousSettings;
  current: QuizCanvasCircleStateCurrentSettings;
  next: QuizCanvasCircleStateSettings;
}

export class QuizCanvasCircleStatePreviousSettings {
  correct: QuizCanvasCircleStateSettings;
  incorrect: QuizCanvasCircleStateSettings;
}

export class QuizCanvasCircleStateCurrentSettings {
  stats: QuizCanvasCircleStateSettings;
  noStats: QuizCanvasCircleStateSettings;
}

export class QuizQuestionSettings {
  maxLength:number;
  answer:QuizQuestionAnswerSettings;
  wrongAnswerMillisecondsDelay:number;
}

export class QuizQuestionAnswerSettings {
  maxLength:number;
}

export class ChartsSettings {
  contest: ChartSettings;
  questionStats:QuestionStatsChartSettings;
}

export class ChartSettings {
  type: string;
  size: Size;
  chartControl: any;
}

export class QuestionStatsChartSettings extends ChartSettings{
  colors: QuestionStatsChartSettingsColors;
}

export class QuestionStatsChartSettingsColors
{
  correct: string;
  incorrect: string;
}

export class Size {
  width:number;
  height:number;
}

export class Question {
  _id:string;
  deleted:boolean;
  checked:boolean;
  text:string;
  answers:Array<string>;

  constructor() {
    this._id = null;
    this.text = null;
    this.answers = [null, null, null, null];
  }
}

export class Questions {
  list:Array<Question>;
  visibleCount:number;

  constructor() {
    this.visibleCount = 0;
    this.list = [];
  }
}

export class User {
  clientInfo:ClientInfo;
  settings:UserSettings;
  geoInfo:Object;
  thirdParty:ThirdPartyInfo;

  constructor(language:string, clientInfo:ClientInfo, geoInfo?:Object) {
    this.settings = new UserSettings();
    this.settings.language = language;
    this.settings.timezoneOffset = (new Date).getTimezoneOffset();
    this.clientInfo = clientInfo;

    if (geoInfo) {
      this.geoInfo = geoInfo;
    }
  }
}

export class ThirdPartyInfo {
  type:string;
  id:string;
  accessToken:string;
}

export class UserSettings {
  language:string;
  timezoneOffset:number;
}

export class ClientInfo {
  appVersion:string;
  platform:string;
  mobile:boolean;

  constructor() {

  }
}

export class Session {
  rank:number;
  features:Object;
  score:number;
  settings:SessionSettings;
  isAdmin:boolean;
  xpProgress:XpProgress;
  gcmRegistrationId:string;
}

export class SessionSettings {
  sound:boolean;
  language:string;
}

export class Feature {
  name:string;
  lockText:string;
  unlockText:string;
  purchaseProductId:string;
  purchaseData: PurchaseData;
}

export class PurchaseData {
  productId: string;
  status: string;
  url: string;
}

export class PaymentData {
  method: string;
  data: PurchaseData;
  constructor(method: string, data: PurchaseData) {
    this.method = method;
    this.data = data;
  }
}

export class View {
  name:string;
  isRoot:boolean;
  params:Object;
}

export class Language {
  value:string;
  direction:string;
  align:string;
  oppositeAlign:string;
  displayNames:Object;
  wiki:string;
  oppositeDirection:string;
  localeDateOptions:LocaleDateOptions;
  locale:string;
  backButtonIcon:string;
}

export class LocaleDateOptions {
  month:string;
  day:string;
  year:string;
}

export class ContestChart {
  contest:Contest;
}

export class CalendarCell {
  dateObject:Date;
  date:number;
  month:number;
  year:number;
  day:number;
  dateString:string;
  epochLocal:number;
  epochUTC:number;
  inMonth:boolean;
  disabled:boolean;
  selected:boolean;
  today:boolean;
}

export class Contest {
  _id:string;
  name:string;
  startDate:number;
  endDate:number;
  myTeam:number;
  participants:number;
  manualParticipants;
  rating:number;
  manualRating:number;
  teams:Array<Team>;
  type:ContestType;
  endOption:string;
  questions:Questions;
  totalParticipants:number;
  userQuestions:Array<string>;
  chartControl:any;
  state: string;

  constructor(startDate:number, endDate:number, type:ContestType) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.type = type;
    this.rating = 0;
    this.manualRating = 0;
    this.participants = 0;
    this.manualParticipants = 0;
    this.endOption = 'h24';
    this.teams = [new Team(), new Team()];
    this.questions = new Questions();
  }
}

export class Team {
  name:string;
  score:number;

  constructor() {
    this.name = null;
    this.score = 0;
  }
}

export class ContestType {
  id:string;
  image: ContestTypeImage;
  text: ContestTypeText;
}

export class ContestTypeImage {
  url: string;
  width: number;
  height: number;
}

export class ContestTypeText {
  title:string;
  description:string;
  name:string;
  titleColor: string;
}

export class QuizResults {
  data:QuizResultsData;
  contest:Contest;
  facebookPost:FacebookPostData;
}

export class QuizResultsData {
  score:number;
  sound:string;
  clientKey:string;
  clientValues:Object;
  animation:string;
  facebookPost:FacebookPostData;
  title:string;
  message:string;
}

export class FacebookPostData {
  action:string;
  object:string;
  dialogImage:FacebookPostDialogImage;
}

export class FacebookPostDialogImage {
  url:string;
  width:number;
  height:number;
}

export class QuizData {
  currentQuestion:QuizQuestion;
  reviewMode:QuizReviewMode;
  currentQuestionIndex:number;
  totalQuestions:number;
  results:QuizResults;
  xpProgress:XpProgress;
  finished:boolean;
}

export class QuizQuestion {
  _id:string;
  text:string;
  answered:boolean;
  currentQuestionIndex:number;
  hintUsed:boolean;
  answerUsed:boolean;
  score:number;
  answers:Array<QuizAnswer>;
  doAnimation:boolean;
  correctRatio:number;
  wikipediaHint:string;
  wikipediaAnswer:string;
  hintCost:number;
  answerCost:number;

  constructor(score:number) {
    this.score = score;
  }
}

export class QuizAnswer {
  answeredCorrectly:boolean;
  text:string;
  originalIndex:number;
  correct:boolean;
}

export class QuizReviewMode {
  reason:string;
}

export class XpProgress {
  current:number;
  max:number;
  addition:number;
  rankChanged:number;
}

export class ServerPopup {
  title:string;
  message:string;
  preventBack:boolean;
  image:string;
  buttons:Array<ServerPopupButton>;
}

export class ServerPopupButton {
  action:string;
  link:string;
  text:string;
}

export class ShareVariables {
  shareUrl:string;
  shareSubject:string;
  shareBody:string;
  shareBodyEmail:string;
  shareBodyNoUrl:string;
}