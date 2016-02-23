import {ExceptionHandler} from "angular2/core";

export class MyExceptionHandler extends ExceptionHandler {
  call(exception: any, stackTrace: any, reason: string): void {
    var errorMessage = exception.message;
    if (exception.wrapperStack) {
      errorMessage += ', ' + exception.wrapperStack;
    }

    FlurryAgent.myLogError('UnhandledException', errorMessage);
    super.call(exception, stackTrace, reason);
  }
}
