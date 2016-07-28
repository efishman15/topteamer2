import {ExceptionHandler} from '@angular/core';
import {Client} from './client';

export class MyArrayLogger {
  res:Array<any> = [];

  log(s:any):void {
    this.res.push(s);
  }

  logError(s:any):void {
    this.res.push(s);
  }

  logGroup(s:any):void {
    this.res.push(s);
  }

  logGroupEnd() {
    this.res.forEach((error:any) => {
      console.error(error);
    })
  };
}

export class MyExceptionHandler extends ExceptionHandler {

  constructor() {
    super(new MyArrayLogger(), true);
  }

  call(exception:any, stackTrace:any, reason:string):void {
    var errorMessage = exception.message;
    if (exception.wrapperStack) {
      errorMessage += ', ' + exception.wrapperStack;
    }

    if (window.myLogError) {
      //might not be initialized yet during app load
      window.myLogError('UnhandledException', errorMessage);
    }

    var client = Client.getInstance();

    if (client) {

      //Post errors to server
      if (
        (
          (!client.settings) ||
          (client.settings && client.settings.general && client.settings.general.postErrors) ||
          (client.session && client.session.isAdmin)
        )) {

        //Will also try to post errors to the server
        let postData:any = {};
        if (exception) {
          postData.exception = exception;
        }
        if (stackTrace) {
          postData.stack = stackTrace;
        }
        if (reason) {
          postData.reason = reason;
        }
        if (client.clientInfo) {
          postData.clientInfo = client.clientInfo;
        }
        if (client.session) {
          postData.sessionId = client.session.token;
        }

        client.serverPost('client/error', postData).then(()=> {
        }, ()=> {
        });

      }

    }
  }
}
