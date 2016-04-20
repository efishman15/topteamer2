"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Settings = (function () {
    function Settings() {
    }
    return Settings;
}());
exports.Settings = Settings;
var GoogleSettings = (function () {
    function GoogleSettings() {
    }
    return GoogleSettings;
}());
exports.GoogleSettings = GoogleSettings;
var GoogleGcmSettings = (function () {
    function GoogleGcmSettings() {
    }
    return GoogleGcmSettings;
}());
exports.GoogleGcmSettings = GoogleGcmSettings;
var XpControl = (function () {
    function XpControl() {
    }
    return XpControl;
}());
exports.XpControl = XpControl;
var XpControlFont = (function () {
    function XpControlFont() {
    }
    return XpControlFont;
}());
exports.XpControlFont = XpControlFont;
var GeneralSettings = (function () {
    function GeneralSettings() {
    }
    return GeneralSettings;
}());
exports.GeneralSettings = GeneralSettings;
var FacebookSettings = (function () {
    function FacebookSettings() {
    }
    return FacebookSettings;
}());
exports.FacebookSettings = FacebookSettings;
var QuizSettings = (function () {
    function QuizSettings() {
    }
    return QuizSettings;
}());
exports.QuizSettings = QuizSettings;
var QuizQuestionsSettings = (function () {
    function QuizQuestionsSettings() {
    }
    return QuizQuestionsSettings;
}());
exports.QuizQuestionsSettings = QuizQuestionsSettings;
var QuizCanvasSettings = (function () {
    function QuizCanvasSettings() {
    }
    return QuizCanvasSettings;
}());
exports.QuizCanvasSettings = QuizCanvasSettings;
var QuizCanvasFontSettings = (function () {
    function QuizCanvasFontSettings() {
    }
    return QuizCanvasFontSettings;
}());
exports.QuizCanvasFontSettings = QuizCanvasFontSettings;
var QuizCanvasSizeSettings = (function () {
    function QuizCanvasSizeSettings() {
    }
    return QuizCanvasSizeSettings;
}());
exports.QuizCanvasSizeSettings = QuizCanvasSizeSettings;
var QuizCanvasScoresSettings = (function () {
    function QuizCanvasScoresSettings() {
    }
    return QuizCanvasScoresSettings;
}());
exports.QuizCanvasScoresSettings = QuizCanvasScoresSettings;
var QuizCanvasScoresSizeSettings = (function () {
    function QuizCanvasScoresSizeSettings() {
    }
    return QuizCanvasScoresSizeSettings;
}());
exports.QuizCanvasScoresSizeSettings = QuizCanvasScoresSizeSettings;
var QuizCanvasScoresColorsSettings = (function () {
    function QuizCanvasScoresColorsSettings() {
    }
    return QuizCanvasScoresColorsSettings;
}());
exports.QuizCanvasScoresColorsSettings = QuizCanvasScoresColorsSettings;
var QuizCanvasCircleSettings = (function () {
    function QuizCanvasCircleSettings() {
    }
    return QuizCanvasCircleSettings;
}());
exports.QuizCanvasCircleSettings = QuizCanvasCircleSettings;
var QuizCanvasCircleRadiusSettings = (function () {
    function QuizCanvasCircleRadiusSettings() {
    }
    return QuizCanvasCircleRadiusSettings;
}());
exports.QuizCanvasCircleRadiusSettings = QuizCanvasCircleRadiusSettings;
var QuizCanvasCircleStateSettings = (function () {
    function QuizCanvasCircleStateSettings() {
    }
    return QuizCanvasCircleStateSettings;
}());
exports.QuizCanvasCircleStateSettings = QuizCanvasCircleStateSettings;
var QuizCanvasLineSettings = (function () {
    function QuizCanvasLineSettings() {
    }
    return QuizCanvasLineSettings;
}());
exports.QuizCanvasLineSettings = QuizCanvasLineSettings;
var QuizCanvasCircleStatesSettings = (function () {
    function QuizCanvasCircleStatesSettings() {
    }
    return QuizCanvasCircleStatesSettings;
}());
exports.QuizCanvasCircleStatesSettings = QuizCanvasCircleStatesSettings;
var QuizCanvasCircleStatePreviousSettings = (function () {
    function QuizCanvasCircleStatePreviousSettings() {
    }
    return QuizCanvasCircleStatePreviousSettings;
}());
exports.QuizCanvasCircleStatePreviousSettings = QuizCanvasCircleStatePreviousSettings;
var QuizCanvasCircleStateCurrentSettings = (function () {
    function QuizCanvasCircleStateCurrentSettings() {
    }
    return QuizCanvasCircleStateCurrentSettings;
}());
exports.QuizCanvasCircleStateCurrentSettings = QuizCanvasCircleStateCurrentSettings;
var QuizQuestionSettings = (function () {
    function QuizQuestionSettings() {
    }
    return QuizQuestionSettings;
}());
exports.QuizQuestionSettings = QuizQuestionSettings;
var QuizQuestionAnswerSettings = (function () {
    function QuizQuestionAnswerSettings() {
    }
    return QuizQuestionAnswerSettings;
}());
exports.QuizQuestionAnswerSettings = QuizQuestionAnswerSettings;
var ChartsSettings = (function () {
    function ChartsSettings() {
    }
    return ChartsSettings;
}());
exports.ChartsSettings = ChartsSettings;
var ChartSettings = (function () {
    function ChartSettings() {
    }
    return ChartSettings;
}());
exports.ChartSettings = ChartSettings;
var QuestionStatsChartSettings = (function (_super) {
    __extends(QuestionStatsChartSettings, _super);
    function QuestionStatsChartSettings() {
        _super.apply(this, arguments);
    }
    return QuestionStatsChartSettings;
}(ChartSettings));
exports.QuestionStatsChartSettings = QuestionStatsChartSettings;
var QuestionStatsChartSettingsColors = (function () {
    function QuestionStatsChartSettingsColors() {
    }
    return QuestionStatsChartSettingsColors;
}());
exports.QuestionStatsChartSettingsColors = QuestionStatsChartSettingsColors;
var Size = (function () {
    function Size() {
    }
    return Size;
}());
exports.Size = Size;
var Question = (function () {
    function Question() {
        this._id = null;
        this.text = null;
        this.answers = [null, null, null, null];
    }
    return Question;
}());
exports.Question = Question;
var Questions = (function () {
    function Questions() {
        this.visibleCount = 0;
        this.list = [];
    }
    return Questions;
}());
exports.Questions = Questions;
var User = (function () {
    function User(language, clientInfo, geoInfo) {
        this.settings = new UserSettings();
        this.settings.language = language;
        this.settings.timezoneOffset = (new Date).getTimezoneOffset();
        this.clientInfo = clientInfo;
        if (geoInfo) {
            this.geoInfo = geoInfo;
        }
    }
    return User;
}());
exports.User = User;
var ThirdPartyInfo = (function () {
    function ThirdPartyInfo() {
    }
    return ThirdPartyInfo;
}());
exports.ThirdPartyInfo = ThirdPartyInfo;
var UserSettings = (function () {
    function UserSettings() {
    }
    return UserSettings;
}());
exports.UserSettings = UserSettings;
var ClientInfo = (function () {
    function ClientInfo() {
    }
    return ClientInfo;
}());
exports.ClientInfo = ClientInfo;
var Session = (function () {
    function Session() {
    }
    return Session;
}());
exports.Session = Session;
var SessionSettings = (function () {
    function SessionSettings() {
    }
    return SessionSettings;
}());
exports.SessionSettings = SessionSettings;
var Feature = (function () {
    function Feature() {
    }
    return Feature;
}());
exports.Feature = Feature;
var PurchaseData = (function () {
    function PurchaseData() {
    }
    return PurchaseData;
}());
exports.PurchaseData = PurchaseData;
var PaymentData = (function () {
    function PaymentData(method, data) {
        this.method = method;
        this.data = data;
    }
    return PaymentData;
}());
exports.PaymentData = PaymentData;
var View = (function () {
    function View() {
    }
    return View;
}());
exports.View = View;
var Language = (function () {
    function Language() {
    }
    return Language;
}());
exports.Language = Language;
var LocaleDateOptions = (function () {
    function LocaleDateOptions() {
    }
    return LocaleDateOptions;
}());
exports.LocaleDateOptions = LocaleDateOptions;
var ContestChart = (function () {
    function ContestChart() {
    }
    return ContestChart;
}());
exports.ContestChart = ContestChart;
var CalendarCell = (function () {
    function CalendarCell() {
    }
    return CalendarCell;
}());
exports.CalendarCell = CalendarCell;
var Contest = (function () {
    function Contest(startDate, endDate, type) {
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
    return Contest;
}());
exports.Contest = Contest;
var Team = (function () {
    function Team() {
        this.name = null;
        this.score = 0;
    }
    return Team;
}());
exports.Team = Team;
var ContestType = (function () {
    function ContestType() {
    }
    return ContestType;
}());
exports.ContestType = ContestType;
var ContestTypeImage = (function () {
    function ContestTypeImage() {
    }
    return ContestTypeImage;
}());
exports.ContestTypeImage = ContestTypeImage;
var ContestTypeText = (function () {
    function ContestTypeText() {
    }
    return ContestTypeText;
}());
exports.ContestTypeText = ContestTypeText;
var QuizResults = (function () {
    function QuizResults() {
    }
    return QuizResults;
}());
exports.QuizResults = QuizResults;
var QuizResultsData = (function () {
    function QuizResultsData() {
    }
    return QuizResultsData;
}());
exports.QuizResultsData = QuizResultsData;
var FacebookPostData = (function () {
    function FacebookPostData() {
    }
    return FacebookPostData;
}());
exports.FacebookPostData = FacebookPostData;
var FacebookPostDialogImage = (function () {
    function FacebookPostDialogImage() {
    }
    return FacebookPostDialogImage;
}());
exports.FacebookPostDialogImage = FacebookPostDialogImage;
var QuizData = (function () {
    function QuizData() {
    }
    return QuizData;
}());
exports.QuizData = QuizData;
var QuizQuestion = (function () {
    function QuizQuestion(score) {
        this.score = score;
    }
    return QuizQuestion;
}());
exports.QuizQuestion = QuizQuestion;
var QuizAnswer = (function () {
    function QuizAnswer() {
    }
    return QuizAnswer;
}());
exports.QuizAnswer = QuizAnswer;
var QuizReviewMode = (function () {
    function QuizReviewMode() {
    }
    return QuizReviewMode;
}());
exports.QuizReviewMode = QuizReviewMode;
var XpProgress = (function () {
    function XpProgress() {
    }
    return XpProgress;
}());
exports.XpProgress = XpProgress;
var ServerPopup = (function () {
    function ServerPopup() {
    }
    return ServerPopup;
}());
exports.ServerPopup = ServerPopup;
var ServerPopupButton = (function () {
    function ServerPopupButton() {
    }
    return ServerPopupButton;
}());
exports.ServerPopupButton = ServerPopupButton;
var ShareVariables = (function () {
    function ShareVariables() {
    }
    return ShareVariables;
}());
exports.ShareVariables = ShareVariables;
//# sourceMappingURL=objects.js.map