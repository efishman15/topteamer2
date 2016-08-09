var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require('@angular/core');
var client_1 = require('./client');
var MyArrayLogger = (function () {
    function MyArrayLogger() {
        this.res = [];
    }
    MyArrayLogger.prototype.log = function (s) {
        this.res.push(s);
    };
    MyArrayLogger.prototype.logError = function (s) {
        this.res.push(s);
    };
    MyArrayLogger.prototype.logGroup = function (s) {
        this.res.push(s);
    };
    MyArrayLogger.prototype.logGroupEnd = function () {
        this.res.forEach(function (error) {
            console.error(error);
        });
    };
    ;
    return MyArrayLogger;
})();
exports.MyArrayLogger = MyArrayLogger;
var MyExceptionHandler = (function (_super) {
    __extends(MyExceptionHandler, _super);
    function MyExceptionHandler() {
        _super.call(this, new MyArrayLogger(), true);
    }
    MyExceptionHandler.prototype.call = function (exception, stackTrace, reason) {
        var errorMessage = exception.message;
        if (exception.wrapperStack) {
            errorMessage += ', ' + exception.wrapperStack;
        }
        if (window.myLogError) {
            //might not be initialized yet during app load
            window.myLogError('UnhandledException', errorMessage);
        }
        var client = client_1.Client.getInstance();
        if (client) {
            //Post errors to server
            if (((!client.settings) ||
                (client.settings && client.settings.general && client.settings.general.postErrors) ||
                (client.session && client.session.isAdmin))) {
                //Will also try to post errors to the server
                var postData = {};
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
                client.serverPost('client/error', postData).then(function () {
                }, function () {
                });
            }
        }
    };
    return MyExceptionHandler;
})(core_1.ExceptionHandler);
exports.MyExceptionHandler = MyExceptionHandler;
//# sourceMappingURL=exceptions.js.map