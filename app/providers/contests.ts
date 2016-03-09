import {Client} from './client';
import {ContestPage} from '../pages/contest/contest'

//------------------------------------------------------
//-- prepareContestChart
//------------------------------------------------------
export let prepareContestChart = (contest) => {

  var client = Client.getInstance();

  var contestCaption;
  var contestCaptionColor;
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

  setTimeDisplay(contest);

  if (contest.status === 'finished') {
    //Contest Finished

    contestCaption = client.translate(contest.type.name);
    if (contest.teams[0].chartValue > contest.teams[1].chartValue) {
      contestCaptionColor = client.settings.charts.captions.finished.win.caption.color;
      contestSubCaption = client.translate('CONTEST_FINISHED_TEAM_WON_CAPTION', {'team': contest.teams[0].name});
      contestSubCaptionColor = client.settings.charts.captions.finished.win.subCaption.color;
      contestChart.chart.paletteColors = client.settings.charts.finishedPalette[teamsOrder[0]];
    }
    else if (contest.teams[0].chartValue < contest.teams[1].chartValue) {
      contestCaptionColor = client.settings.charts.captions.finished.win.caption.color;
      contestSubCaption = client.translate('CONTEST_FINISHED_TEAM_WON_CAPTION', {'team': contest.teams[1].name});
      contestSubCaptionColor = client.settings.charts.captions.finished.win.subCaption.color;
      contestChart.chart.paletteColors = client.settings.charts.finishedPalette[teamsOrder[1]];
    }
    else {
      contestCaptionColor = client.settings.charts.captions.finished.tie.caption.color;
      contestSubCaption = client.translate('TIE');
      contestSubCaptionColor = client.settings.charts.captions.finished.tie.subCaption.color;
      contestChart.chart.paletteColors = client.settings.charts.finishedPalette[2];
    }

  }
  else {
    contestCaption = contest.teams[0].name + ' ' + client.translate('AGAINST') + ' ' + contest.teams[1].name;
    contestCaptionColor = client.settings.charts.captions.running.caption.color;
    contestSubCaption = client.translate(contest.type.name);
    contestSubCaptionColor = client.settings.charts.captions.running.subCaption.color;
  }

  var contestTimeWidth = client.canvasContext.measureText(contest.time.end.text).width;
  var contestParticipantsString = client.translate('CONTEST_PARTICIPANTS', {participants: contest.participants + contest.manualParticipants});
  var contestParticipantsWidth = client.canvasContext.measureText(contestParticipantsString).width;

  var magicNumbers = client.settings.charts.contestAnnotations.annotationHorizontalMagicNumbers[direction];

  contestChart.annotations.groups[0].items[magicNumbers.time.id].text = contest.time.end.text;
  contestChart.annotations.groups[0].items[magicNumbers.time.id].x = magicNumbers.time.position + (contestTimeWidth / 2 + magicNumbers.time.spacing);
  contestChart.annotations.groups[0].items[magicNumbers.time.id].fontColor = contest.time.end.color;

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
  contestChart.chart.captionFontColor = contestCaptionColor;
  contestChart.chart.subCaptionFontColor = contestSubCaptionColor;

  return contestChart;

};

//------------------------------------------------------
//-- list
//------------------------------------------------------
export let list = (tab:String) => {
  var postData = {'tab': tab};
  var client = Client.getInstance();
  return client.serverPost('contests/list', postData);
}

//------------------------------------------------------
//-- join
//------------------------------------------------------
export let join = (contestId:string, teamId:number) => {
  var postData = {'contestId': contestId, 'teamId': teamId};
  var client = Client.getInstance();
  return client.serverPost('contests/join', postData);
}

//------------------------------------------------------
//-- getContest
//------------------------------------------------------
export let getContest = (contestId:string) => {

  var postData = {'contestId': contestId};
  var client = Client.getInstance();
  return client.serverPost('contests/get', postData);
}

//------------------------------------------------------
//-- openContest
//------------------------------------------------------
export let openContest = (contestId:string) => new Promise((resolve, reject) => {

  var client = Client.getInstance();

  getContest(contestId).then( (contest) => {
    client.nav.push(ContestPage, {'contestChart': prepareContestChart(contest)});
    resolve();
  })
})

//------------------------------------------------------
//-- openContest
//------------------------------------------------------
export let removeContest = (contestId:string) => {
  var postData = {'contestId': contestId};
  var client = Client.getInstance();
  return client.serverPost('contests/remove', postData);
}

//------------------------------------------------------
//-- openContest
//------------------------------------------------------
export let setContest = (contest:Object, mode:string, nameChanged:Boolean) => {
  var postData = {'contest': contest, 'mode': mode};
  if (nameChanged) {
    postData['nameChanged'] = nameChanged;
  }

  var client = Client.getInstance();
  return client.serverPost('contests/set', postData);
}

//------------------------------------------------------
//-- searchMyQuestions
//------------------------------------------------------
export let searchMyQuestions = (text:String, existingQuestionIds:Array<String>) => {
  var postData = {'text': text, 'existingQuestionIds': existingQuestionIds};
  var client = Client.getInstance();
  return client.serverPost('contests/searchMyQuestions', postData);
};

//------------------------------------------------------
//-- getQuestions
//------------------------------------------------------
export let getQuestions = (userQuestions) => {
  var postData = {'userQuestions': userQuestions};
  var client = Client.getInstance();
  return client.serverPost('contests/getQuestions', postData);
};

//------------------------------------------------------
//-- setTimeDisplay
//-- Sets the contest.time object - see as follows
//------------------------------------------------------
function setTimeDisplay(contest) {

  var client = Client.getInstance();

  var now = (new Date()).getTime();

  contest.time = {
    'start': {
      'text': null,
      'color': null
    },
    'end': {
      'text': null,
      'color': null
    }
  };

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

  var term;
  var number;
  var units;
  var color;
  var minutes;

  //-------------------
  // Start Time
  //-------------------
  minutes = Math.abs(now - contest.startDate) / 1000 / 60;
  if (minutes >= 60 * 24) {
    number = Math.ceil(minutes / 24 / 60);
    units = 'DAYS';
  }
  else if (minutes >= 60) {
    number = Math.ceil(minutes / 60);
    units = 'HOURS';
  }
  else {
    number = Math.ceil(minutes);
    units = 'MINUTES';
  }
  if (now > contest.startDate) {
    term = 'CONTEST_STARTED';
    color = client.settings.charts.contestAnnotations.time.running.color;
  }
  else {
    term = 'CONTEST_STARTING';
    color = client.settings.charts.contestAnnotations.time.starting.color;
  }
  contest.time.start.text = client.translate(term, {number: number, units: client.translate(units)});
  contest.time.start.color = color;

  //-------------------
  // End Time
  //-------------------
  minutes = Math.abs(contest.endDate - now) / 1000 / 60;
  if (minutes >= 60 * 24) {
    number = Math.ceil(minutes / 24 / 60);
    units = 'DAYS';
  }
  else if (minutes >= 60) {
    number = Math.ceil(minutes / 60);
    units = 'HOURS';
  }
  else {
    number = Math.ceil(minutes);
    units = 'MINUTES';
  }
  if (now < contest.endDate) {
    term = 'CONTEST_ENDS_IN';
    color = client.settings.charts.contestAnnotations.time.running.color;
  }
  else {
    term = 'CONTEST_ENDED';
    color = client.settings.charts.contestAnnotations.time.finished.color;
  }
  contest.time.end.text = client.translate(term, {number: number, units: client.translate(units)});
  contest.time.end.color = color;
}
