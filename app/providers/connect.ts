import {Client} from './client';
import * as facebookService from './facebook';
import {ConnectInfo,GuestInfo} from '../objects/objects';

const CONNECT_INFO_KEY = 'connectInfo';

//------------------------------------------------------
//-- createGuest
//------------------------------------------------------
export let createGuest = () => {

  var client = Client.getInstance();

  var d = new Date().getTime();
  var uuid = 'xxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  let connectInfo:ConnectInfo = new ConnectInfo('guest');
  connectInfo.guestInfo = new GuestInfo(uuid);
  localStorage.setItem(CONNECT_INFO_KEY, JSON.stringify(connectInfo));

  client.connectInfo = connectInfo;

  return connectInfo;
};

//------------------------------------------------------
//-- getLoginStatus
//------------------------------------------------------
export let getInfo = () => {

  return new Promise((resolve, reject) => {

    var client = Client.getInstance();

    if (client.connectInfo) {
      resolve(client.connectInfo);
      return;
    }

    let connectInfoString:string = localStorage.getItem(CONNECT_INFO_KEY);
    if (connectInfoString) {
      client.connectInfo = JSON.parse(connectInfoString);
      resolve(client.connectInfo);
      return;
    }

    //Legacy code - for old clients which are connected to facebook but still
    //do not have
    facebookService.getLoginStatus().then((connectInfo:ConnectInfo) => {
      if (connectInfo.facebookInfo) {
        localStorage.setItem(CONNECT_INFO_KEY, JSON.stringify({type: 'facebook'}));
        client.connectInfo = connectInfo;
        resolve(connectInfo);
      }
      else {
        //No connect type yet
        reject();
      }
    }, ()=> {
      reject();
    })
  });
}

//------------------------------------------------------
//-- getLoginStatus
//------------------------------------------------------
export let getLoginStatus = () => {

  return new Promise((resolve, reject) => {

    getInfo().then((connectInfo:ConnectInfo) => {
      switch (connectInfo.type) {
        case 'facebook':
          if (connectInfo.facebookInfo) {
            resolve(connectInfo);
          }
          else {
            facebookService.getLoginStatus().then((connectInfo:ConnectInfo)=> {
              resolve(connectInfo);
            }, () => {
              reject();
            })
          }
          break;
        case 'guest':
          resolve(connectInfo);
          break;
        default:
          reject();
          break;
      }
    }, () => {
      reject();
    })
  });
}

//------------------------------------------------------
//-- login
//------------------------------------------------------
export let login = (permissions?, rerequestDeclinedPermissions?) => {

  return new Promise((resolve, reject) => {

    getInfo().then((connectInfo:ConnectInfo) => {
      switch (connectInfo.type) {
        case 'facebook':
          facebookService.login(permissions, rerequestDeclinedPermissions).then((connectInfo:ConnectInfo) => {
            resolve(connectInfo);
          }, () => {
            reject();
          });
          break;
        case 'guest':
          //Immediate resolve, connectionInfo will include the uuid
          resolve(connectInfo);
          break;
      }
    }, () => {
      reject();
    });
  });
}

//------------------------------------------------------
//-- logout
//------------------------------------------------------
export let logout = () => {

  return new Promise((resolve, reject) => {

    getInfo().then((connectInfo:ConnectInfo) => {
      switch (connectInfo.type) {
        case 'facebook':
          facebookService.logout().then(()=> {
            localStorage.removeItem(CONNECT_INFO_KEY);
            resolve();
          });
        case 'guest':
          localStorage.removeItem(CONNECT_INFO_KEY);
          resolve();
      }
    }, ()=> {
      reject();
    });
  });
}

//------------------------------------------------------
//-- post
//------------------------------------------------------
export let post = (story:any) => {

  return new Promise((resolve, reject) => {

    getInfo().then((connectInfo:ConnectInfo) => {
      switch (connectInfo.type) {
        case 'facebook':
          facebookService.post(story).then(()=> {
            resolve();
          }, ()=> {
            reject();
          });
          break;
        case 'guest':
          throw new Error('Posting in guest mode is not supported');
      }
    }, ()=> {
      reject();
    });
  });
};

//------------------------------------------------------
//-- buy
//------------------------------------------------------
export let buy = (purchaseDialogData:any) => {

  return new Promise((resolve, reject) => {

    getInfo().then((connectInfo:ConnectInfo) => {
      switch (connectInfo.type) {
        case 'facebook':
          facebookService.buy(purchaseDialogData).then(()=> {
            resolve();
          }, ()=> {
            reject();
          });
          break;
        case 'guest':
          throw new Error('Buying in guest mode is not supported');
      }
    }, ()=> {
      reject();
    });
  });
};
