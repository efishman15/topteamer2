"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require('angular2/core');
var client_1 = require('./client');
var MyExceptionHandler = (function (_super) {
    __extends(MyExceptionHandler, _super);
    function MyExceptionHandler() {
        _super.apply(this, arguments);
    }
    MyExceptionHandler.prototype.call = function (exception, stackTrace, reason) {
        var errorMessage = exception.message;
        if (exception.wrapperStack) {
            errorMessage += ', ' + exception.wrapperStack;
        }
        var client = client_1.Client.getInstance();
        console.error(errorMessage);
        window.myLogError('UnhandledException', errorMessage);
        _super.prototype.call.call(this, exception, stackTrace, reason);
    };
    return MyExceptionHandler;
}(core_1.ExceptionHandler));
exports.MyExceptionHandler = MyExceptionHandler;
