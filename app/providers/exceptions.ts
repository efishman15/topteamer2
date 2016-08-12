import {ExceptionHandler} from '@angular/core';
import {Client} from './client';
import * as analyticsService from './analytics';

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

    analyticsService.logError('UnhandledException', {exception: exception, stack: stackTrace});

    var client = Client.getInstance();
    if (client && client.session && client.session.isAdmin) {
      super.call(exception, stackTrace, reason);
    }
  }
}
