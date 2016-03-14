import {Client} from './client';

//------------------------------------------------------
//-- friends
//------------------------------------------------------
export let friends = (friendsPermissionJustGranted : boolean) => {
  var postData = {};
  if (friendsPermissionJustGranted) {
    postData['friendsPermissionJustGranted'] = friendsPermissionJustGranted;
  }
  var client = Client.getInstance();
  return client.serverPost('leaderboard/friends', postData);
}

//------------------------------------------------------
//-- weekly
//------------------------------------------------------
export let weekly = () => {
  var client = Client.getInstance();
  return client.serverPost('leaderboard/weekly');
}

//------------------------------------------------------
//-- contest
//------------------------------------------------------
export let contest = (contestId: string, teamId? : number) => {
  var postData = {'contestId' : contestId};
  if (teamId === 0 || teamId === 1) {
    postData['teamId'] = teamId;
  }
  var client = Client.getInstance();
  return client.serverPost('leaderboard/contest', postData);
}

