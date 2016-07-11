import {Client} from './client';
import {Contest, Team, ContestName} from '../objects/objects';

//------------------------------------------------------
//-- Private Functions
//------------------------------------------------------

//------------------------------------------------------
//-- list
//------------------------------------------------------
export let list = (tab:String) => {
  var postData = {'tab': tab};
  return new Promise((resolve, reject) => {
    var client = Client.getInstance();
    client.serverPost('contests/list', postData).then((contests: Array<Contest>) => {
      contests.forEach((contest:Contest) => {
        setContestClientData(contest);
      });
      resolve(contests);
    }, (err) => {
      reject(err);
    });
  });
}

//------------------------------------------------------
//-- join
//------------------------------------------------------
export let join = (contestId:string, teamId:number) => {
  var postData = {'contestId': contestId, 'teamId': teamId};
  var client = Client.getInstance();
  return new Promise((resolve, reject) => {
    client.serverPost('contests/join', postData).then((data : any) => {
      setContestClientData(data.contest);
      resolve(data);
    }, (err) => {
      reject(err);
    })
  });

}

//------------------------------------------------------
//-- getContest
//------------------------------------------------------
export let getContest = (contestId:string) => {

  var postData = {'contestId': contestId};
  var client = Client.getInstance();
  return new Promise((resolve, reject) => {
    client.serverPost('contests/get', postData).then((contest: Contest) => {
      setContestClientData(contest);
      resolve(contest);
    }, (err) => {
      reject(err)
    });
  });
}

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

  var client = Client.getInstance();
  return new Promise((resolve, reject) => {
    client.serverPost('contests/set', postData).then((contest : Contest) => {
      setContestClientData(contest);
      resolve(contest);
    }, (err) => {
      reject(err);
    })
  });
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
//-- setContestClientData
//-- Sets the contest.time object, state, status
//------------------------------------------------------
export let setContestClientData = (contest:Contest) => {

  var client = Client.getInstance();
  var now = (new Date()).getTime();

  //-------------------
  // status, state
  //-------------------
  contest.status = getContestStatus(contest, now);
  if (contest.status === 'finished') {
    contest.state = 'finished';
  }
  else {
    if (contest.myTeam === 0 || contest.myTeam === 1) {
      contest.state = 'play';
    }
    else {
      contest.state = 'join';
    }
  }

  var term;
  var number;
  var units;
  var color;
  var minutes;

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

  //-------------------
  // time.start
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
    color = client.settings.charts.contest.time.running.color;
  }
  else {
    term = 'CONTEST_STARTING';
    color = client.settings.charts.contest.time.starting.color;
  }
  contest.time.start.text = client.translate(term, {
    number: number,
    units: client.translate(units)
  });
  contest.time.start.color = color;

  //-------------------
  // time.end
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
    color = client.settings.charts.contest.time.running.color;
  }
  else {
    term = 'CONTEST_ENDED';
    color = client.settings.charts.contest.time.finished.color;
  }
  contest.time.end.text = client.translate(term, {
    number: number,
    units: client.translate(units)
  });
  contest.time.end.color = color;

  //Chart values
  if (contest.teams[0].score === 0 && contest.teams[1].score === 0) {
    contest.teams[0].chartValue = 0.5;
    contest.teams[1].chartValue = 0.5;
    contest.leadingTeam = -1;
  }
  else {
    //Do relational compute
    var sum = contest.teams[0].score + contest.teams[1].score;
    contest.teams[0].chartValue = Math.round(contest.teams[0].score * 100 / sum) / 100;
    contest.teams[1].chartValue = Math.round(contest.teams[1].score * 100 / sum) / 100;
    if (contest.teams[0].score > contest.teams[1].score) {
      contest.leadingTeam = 0;
    }
    else {
      contest.leadingTeam = 1;
    }
  }

  //-------------------
  // dataSource
  //-------------------
  contest.dataSource = JSON.parse(JSON.stringify(client.settings.charts.contest.dataSource));

  var teamsOrder;

  if (client.currentLanguage.direction === 'ltr') {
    teamsOrder = [0, 1];
  }
  else {
    teamsOrder = [1, 0];
    contest.dataSource.chart.hasRTLText = 1;
  }

  contest.dataSource.annotations.groups[0].items[teamsOrder[0]].text = contest.teams[0].name;
  contest.dataSource.annotations.groups[0].items[0].x = '$dataset.0.set.0.centerX';

  contest.dataSource.annotations.groups[0].items[teamsOrder[1]].text = contest.teams[1].name;
  contest.dataSource.annotations.groups[0].items[1].x = '$dataset.0.set.1.centerX';

  if (contest.myTeam === 0 || contest.myTeam === 1) {
    var myTeamProperties = Object.keys(client.settings.charts.contest.myTeam[teamsOrder[contest.myTeam]]);
    for (var i = 0; i < myTeamProperties.length; i++) {
      //Apply all properties of "my team" to the label of my team
      contest.dataSource.annotations.groups[0].items[teamsOrder[contest.myTeam]][myTeamProperties[i]] = client.settings.charts.contest.myTeam[contest.myTeam][myTeamProperties[i]];
    }
  }

  contest.dataSource.categories[0].category[0].label = Math.round(contest.teams[teamsOrder[0]].chartValue * 100) + '%';
  contest.dataSource.categories[0].category[1].label = Math.round(contest.teams[teamsOrder[1]].chartValue * 100) + '%';

  //-------------------
  // dataSource
  //-------------------
  contest.name = new ContestName();
  contest.name.long = client.translate('CONTEST_NAME_LONG', {
    'team0': contest.teams[0].name,
    'team1': contest.teams[1].name,
    'subject': contest.subject
  });
  contest.name.short = client.translate('CONTEST_NAME_SHORT', {
    'team0': contest.teams[0].name,
    'team1': contest.teams[1].name
  });

}

export let cloneForEdit = (contest: Contest) => {
  let newContest = new Contest(contest.type.id, contest.startDate, contest.endDate);
  newContest._id = contest._id;
  newContest.teams = [new Team(contest.teams[0].name), new Team(contest.teams[1].name)];

  if (this.questions) {
    newContest.questions = JSON.parse(JSON.stringify(contest.questions));
  }

  newContest.subject = contest.subject;

  if (contest.systemParticipants) {
    newContest.systemParticipants = contest.systemParticipants;
  }

  if (contest.rating) {
    newContest.rating = contest.rating;
  }

  if (contest.type.id === 'userTrivia') {
    newContest.type = JSON.parse(JSON.stringify(contest.type));
  }

  return newContest;
}

//-------------------
// status
//-------------------
export let getContestStatus = (contest: Contest, now?: number) => {

  if (now === undefined) {
    now = (new Date()).getTime();
  }

  if (contest.endDate < now) {
    return 'finished';
  }
  else {
    if (contest.startDate > now) {
      return 'starting';
    }
    else {
      return 'running';
    }
  }
}
