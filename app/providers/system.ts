import {Client} from './client';

//------------------------------------------------------
//-- clearCache
//------------------------------------------------------
export let clearCache = () => {
  var client = Client.getInstance();
  return client.serverPost('system/clearCache');
}

//------------------------------------------------------
//-- restart
//------------------------------------------------------
export let restart = () => {
  var client = Client.getInstance();
  return client.serverPost('system/restart');
}
