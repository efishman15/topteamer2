import {ExceptionHandler} from 'angular2/core';
import {Client} from './client';

export class MyExceptionHandler extends ExceptionHandler {
  call(exception: any, stackTrace: any, reason: string): void {
    var errorMessage = exception.message;
    if (exception.wrapperStack) {
      errorMessage += ', ' + exception.wrapperStack;
    }

    var client = Client.getInstance();

    console.error(errorMessage);

    if (window.myLogError) {
      //might not be initialized yet during app load
      window.myLogError('UnhandledException', errorMessage);
    }

    super.call(exception, stackTrace, reason);
  }
}
