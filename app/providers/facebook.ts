import {Client} from './client';
//------------------------------------------------------
//-- getLoginStatus
//------------------------------------------------------
export let getLoginStatus = () => new Promise((resolve, reject) => {
  if (!window.cordova) {
    FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        resolve({'connected': true, 'response': response});
      }
      else {
        resolve({'connected': false, 'response': response});
      }
    });
  }
  else {
    facebookConnectPlugin.getLoginStatus((response) => {
      if (response && response.status === 'unknown') {
        //Give it another try as facebook native is not yet initiated
        setTimeout(() => {
          facebookConnectPlugin.getLoginStatus((response) => {
            if (response && response.status === 'connected') {
              resolve({'connected': true, 'response': response});
            }
            else {
              resolve({'connected': false, 'response': response});
            }
          }, (error) => {
            resolve({'connected': false, 'error': error})
          })
        }, 500);
      }
      else if (response && response.status === 'connected') {
        resolve({'connected': true, 'response': response});
      }
      else {
        resolve({'connected': false, 'response': response});
      }

    }, (error) => {
      resolve({'connected': false, 'error': error});
    });
  }
});

//------------------------------------------------------
//-- login
//------------------------------------------------------
export let login = (rerequestDeclinedPermissions?) => new Promise((resolve, reject) => {

  var client = Client.getInstance();

  if (!window.cordova) {

    var permissionObject = {};
    if (client.settings.facebook.readPermissions && client.settings.facebook.readPermissions.length > 0) {
      permissionObject.scope = client.settings.facebook.readPermissions.toString();
      if (rerequestDeclinedPermissions) {
        permissionObject.auth_type = 'rerequest';
      }
    }

    FB.login((response) => {
      if (response.authResponse) {
        resolve(response);
      }
      else {
        reject(response.status)
      }
    },permissionObject);
  }
  else {
    facebookConnectPlugin.login(client.settings.facebook.readPermissions,
      (response) => {
        resolve(response);
      },
      (err) => {
        reject(err);
      }
    );
  }
});

//------------------------------------------------------
//-- logout
//------------------------------------------------------
export let logout = () => new Promise((resolve, reject) => {

  if (!window.cordova) {

    FB.logout((response) => {
      resolve(response);
    });
  }
  else {
    facebookConnectPlugin.logout((response) => {
        resolve(response);
      }
    );
  }
});

//------------------------------------------------------
//-- post
//------------------------------------------------------
export let post = (story) => new Promise((resolve, reject) => {

  if (window.cordova) {
    var mobilePostObject = {
      'method': 'share_open_graph',
      'action': story.action,
      'previewPropertyName': story.object.name,
      'previewPropertyValue': story.object.value
    };

    facebookConnectPlugin.showDialog(mobilePostObject, (response) => {
      resolve(response);
    }, (error) => {
      reject(error);
    })
  }
  else {
    var webPostObject = {
      'method': 'share_open_graph',
      'action_type': story.action,
      'action_properties': {}
    };
    webPostObject.action_properties[story.object.name] = story.object.value;

    try {
      FB.ui(webPostObject, (response) => {
        resolve(response);
      });
    } catch (error) {
      reject(error);
    }
  }
});

//------------------------------------------------------
//-- buy
//------------------------------------------------------
export let buy = (purchaseDialogData) => new Promise((resolve, reject) => {

  try {
    FB.ui(purchaseDialogData, (response) => {
      resolve(response);
    });
  } catch (error) {
    reject(error);
  }
});
