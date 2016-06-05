import {Client} from './client';

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
