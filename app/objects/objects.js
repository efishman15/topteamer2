"use strict";
var Settings = (function () {
    function Settings() {
    }
    return Settings;
}());
exports.Settings = Settings;
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
var QuizCanvasSettings = (function () {
    function QuizCanvasSettings() {
    }
    return QuizCanvasSettings;
}());
exports.QuizCanvasSettings = QuizCanvasSettings;
var QuizCanvasScoresSettings = (function () {
    function QuizCanvasScoresSettings() {
    }
    return QuizCanvasScoresSettings;
}());
exports.QuizCanvasScoresSettings = QuizCanvasScoresSettings;
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
    function User() {
    }
    return User;
}());
exports.User = User;
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
