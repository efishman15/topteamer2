var server_1 = require('./server');
//------------------------------------------------------
//-- prepareContestChart
//------------------------------------------------------
exports.prepareContestChart = function (contest, timeMode) {
    var server = server_1.Server.getInstance();
    var contestCaption;
    var contestSubCaption;
    var contestSubCaptionColor;
    var contestChart = JSON.parse(JSON.stringify(server.settings.charts.contest));
    contestChart.contest = contest;
    contestChart.data = [];
    var teamsOrder;
    var direction = server.currentLanguage.direction;
    if (direction == 'ltr') {
        teamsOrder = [0, 1];
    }
    else {
        teamsOrder = [1, 0];
    }
    setTimePhrase(contest, timeMode);
    if (timeMode === 'ends' && contest.status === 'finished') {
        //Contest Finished
        contestCaption = server.translate('WHO_IS_SMARTER_QUESTION_CONTEST_FINISHED');
        if (contest.teams[0].chartValue > contest.teams[1].chartValue) {
            contestSubCaption = contest.teams[0].name;
            contestChart.chart.paletteColors = server.settings.charts.finishedPalette[teamsOrder[0]];
        }
        else if (contest.teams[0].chartValue < contest.teams[1].chartValue) {
            contestSubCaption = contest.teams[1].name;
            contestChart.chart.paletteColors = server.settings.charts.finishedPalette[teamsOrder[1]];
        }
        else {
            contestSubCaption = server.translate('TIE');
            contestChart.chart.paletteColors = server.settings.charts.finishedPalette[2];
        }
        contestSubCaptionColor = server.settings.charts.subCaption.finished.color;
    }
    else {
        contestCaption = server.translate('WHO_IS_SMARTER');
        contestSubCaption = server.translate('CONTEST_NAME', {
            team0: contest.teams[0].name,
            team1: contest.teams[1].name
        });
        contestSubCaptionColor = server.settings.charts.subCaption.running.color;
    }
    var contestTimeWidth = server.canvasContext.measureText(contest.timePhrase.text).width;
    var contestParticipantsString = server.translate('CONTEST_PARTICIPANTS', { participants: contest.participants + contest.manualParticipants });
    var contestParticipantsWidth = server.canvasContext.measureText(contestParticipantsString).width;
    var magicNumbers = server.settings.charts.contestAnnotations.annotationHorizontalMagicNumbers[direction];
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
//Retruns an object {'time' : 'ends in xxx, started in xxx, ended xxx days ago, starting etc...', 'color' : #color
function setTimePhrase(contest, timeMode) {
    var server = server_1.Server.getInstance();
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
        contestTimeColor = server.settings.charts.contestAnnotations.time.running.color;
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
            contestTimeColor = server.settings.charts.contestAnnotations.time.running.color;
        }
        else {
            //Contest Finished
            contestTimeTerm = 'CONTEST_ENDED';
            contestTimeColor = server.settings.charts.contestAnnotations.time.finished.color;
        }
    }
    var contestTimeString = server.translate(contestTimeTerm, {
        number: contestTimeNumber,
        units: server.translate(contestTimeUnits)
    });
    contest.timePhrase = { 'text': contestTimeString, 'color': contestTimeColor };
}
