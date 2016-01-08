var client_1 = require('./client');
var contest_1 = require('../pages/contest/contest');
//------------------------------------------------------
//-- prepareContestChart
//------------------------------------------------------
exports.prepareContestChart = function (contest, timeMode) {
    var client = client_1.Client.getInstance();
    var contestCaption;
    var contestSubCaption;
    var contestSubCaptionColor;
    var contestChart = JSON.parse(JSON.stringify(client.settings.charts.contest));
    contestChart.contest = contest;
    contestChart.data = [];
    var teamsOrder;
    var direction = client.currentLanguage.direction;
    if (direction == 'ltr') {
        teamsOrder = [0, 1];
    }
    else {
        teamsOrder = [1, 0];
    }
    setTimePhrase(contest, timeMode);
    if (contest.status === 'finished') {
        //Contest Finished
        contestCaption = client.translate('WHO_IS_SMARTER_QUESTION_CONTEST_FINISHED');
        if (contest.teams[0].chartValue > contest.teams[1].chartValue) {
            contestSubCaption = contest.teams[0].name;
            contestChart.chart.paletteColors = client.settings.charts.finishedPalette[teamsOrder[0]];
        }
        else if (contest.teams[0].chartValue < contest.teams[1].chartValue) {
            contestSubCaption = contest.teams[1].name;
            contestChart.chart.paletteColors = client.settings.charts.finishedPalette[teamsOrder[1]];
        }
        else {
            contestSubCaption = client.translate('TIE');
            contestChart.chart.paletteColors = client.settings.charts.finishedPalette[2];
        }
        contestSubCaptionColor = client.settings.charts.subCaption.finished.color;
    }
    else {
        contestCaption = client.translate('WHO_IS_SMARTER');
        contestSubCaption = client.translate('CONTEST_NAME', {
            team0: contest.teams[0].name,
            team1: contest.teams[1].name
        });
        contestSubCaptionColor = client.settings.charts.subCaption.running.color;
    }
    var contestTimeWidth = client.canvasContext.measureText(contest.timePhrase.text).width;
    var contestParticipantsString = client.translate('CONTEST_PARTICIPANTS', { participants: contest.participants + contest.manualParticipants });
    var contestParticipantsWidth = client.canvasContext.measureText(contestParticipantsString).width;
    var magicNumbers = client.settings.charts.contestAnnotations.annotationHorizontalMagicNumbers[direction];
    contestChart.annotations.groups[0].items[magicNumbers.time.id].text = contest.timePhrase.text;
    contestChart.annotations.groups[0].items[magicNumbers.time.id].x = magicNumbers.time.position + (contestTimeWidth / 2 + magicNumbers.time.spacing);
    contestChart.annotations.groups[0].items[magicNumbers.time.id].fontColor = contest.timePhrase.color;
    contestChart.annotations.groups[0].items[magicNumbers.participants.id].text = contestParticipantsString;
    contestChart.annotations.groups[0].items[magicNumbers.participants.id].x = magicNumbers.participants.position + (contestParticipantsWidth / 2 + magicNumbers.participants.spacing);
    contestChart.data.push({
        'label': contest.teams[teamsOrder[0]].name,
        'value': contest.teams[teamsOrder[0]].chartValue,
    });
    contestChart.data.push({
        'label': contest.teams[teamsOrder[1]].name,
        'value': contest.teams[teamsOrder[1]].chartValue
    });
    if (contest.myTeam === 0 || contest.myTeam === 1) {
        contestChart.data[teamsOrder[contest.myTeam]].labelFontBold = true;
        if (contest.status !== 'finished') {
            contest.state = 'play';
        }
        else {
            contest.state = 'none';
        }
    }
    else {
        if (contest.status !== 'finished') {
            contest.state = 'join';
        }
        else {
            contest.state = 'none';
        }
    }
    contestChart.chart.caption = contestCaption;
    contestChart.chart.subCaption = contestSubCaption;
    contestChart.chart.subCaptionFontColor = contestSubCaptionColor;
    return contestChart;
};
exports.openContest = function (contestId) {
    var postData = { 'contestId': contestId };
    var client = client_1.Client.getInstance();
    client.serverPost('contests/get', postData).then(function (contest) {
        client.nav.push(contest_1.ContestPage, { 'contestChart': exports.prepareContestChart(contest, "starts") });
    });
};
//Retruns an object {'time' : 'ends in xxx, started in xxx, ended xxx days ago, starting etc...', 'color' : #color
function setTimePhrase(contest, timeMode) {
    var client = client_1.Client.getInstance();
    var now = (new Date()).getTime();
    //Set contest status
    if (contest.endDate < now) {
        contest.status = 'finished';
    }
    else if (contest.startDate > now) {
        contest.status = 'starting';
    }
    else {
        contest.status = 'running';
    }
    var contestTimeTerm;
    var contestTimeNumber;
    var contestTimeUnits;
    var contestTimeColor;
    if (timeMode === 'starts') {
        var startMinutes = Math.abs(now - contest.startDate) / 1000 / 60;
        if (startMinutes >= 60 * 24) {
            contestTimeNumber = Math.ceil(startMinutes / 24 / 60);
            contestTimeUnits = 'DAYS';
        }
        else if (startMinutes >= 60) {
            contestTimeNumber = Math.ceil(startMinutes / 60);
            contestTimeUnits = 'HOURS';
        }
        else {
            contestTimeNumber = Math.ceil(startMinutes);
            contestTimeUnits = 'MINUTES';
        }
        contestTimeColor = client.settings.charts.contestAnnotations.time.running.color;
        if (contest.status === 'running') {
            contestTimeTerm = 'CONTEST_STARTED';
        }
        else {
            contestTimeTerm = 'CONTEST_STARTING';
        }
    }
    else if (timeMode === 'ends') {
        var endMinutes = Math.abs(contest.endDate - now) / 1000 / 60;
        if (endMinutes >= 60 * 24) {
            contestTimeNumber = Math.ceil(endMinutes / 24 / 60);
            contestTimeUnits = 'DAYS';
        }
        else if (endMinutes >= 60) {
            contestTimeNumber = Math.ceil(endMinutes / 60);
            contestTimeUnits = 'HOURS';
        }
        else {
            contestTimeNumber = Math.ceil(endMinutes);
            contestTimeUnits = 'MINUTES';
        }
        if (contest.status === 'running') {
            contestTimeTerm = 'CONTEST_ENDS_IN';
            contestTimeColor = client.settings.charts.contestAnnotations.time.running.color;
        }
        else {
            //Contest Finished
            contestTimeTerm = 'CONTEST_ENDED';
            contestTimeColor = client.settings.charts.contestAnnotations.time.finished.color;
        }
    }
    var contestTimeString = client.translate(contestTimeTerm, {
        number: contestTimeNumber,
        units: client.translate(contestTimeUnits)
    });
    contest.timePhrase = { 'text': contestTimeString, 'color': contestTimeColor };
}
