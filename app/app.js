var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_1 = require('ionic/ionic');
var tabs_1 = require('./pages/tabs/tabs');
var login_1 = require('./pages/login/login');
var facebookService = require('./providers/facebook');
var server_1 = require('./providers/server');
var topTeamerApp = (function () {
    function topTeamerApp(app, platform, server) {
        var _this = this;
        this.app = app;
        this.platform = platform;
        this.server = server;
        // create an list of pages that can be navigated to from the menu
        // the menu only works after login
        // the login page disables the menu
        this.pages = [
            { title: 'RunningContests', page: tabs_1.TabsPage, icon: 'calendar' },
            { title: 'Login', page: login_1.LoginPage, icon: 'log-in' },
        ];
        server.init(platform).then(function () {
            _this.nav = _this.app.getComponent('nav');
            _this.menu = _this.app.getComponent('leftMenu');
            var dir = document.createAttribute("dir");
            dir.value = server.currentLanguage.direction;
            _this.nav.getElementRef().nativeElement.attributes.setNamedItem(dir);
            _this.menu.side = server.currentLanguage.align;
            _this.menu.id = server.currentLanguage.align + "Menu";
            _this.initApp();
        });
    }
    topTeamerApp.prototype.openPage = function (page, isRoot, isFromMenu) {
        var _this = this;
        if (isRoot) {
            this.nav.setRoot(page).then(function () {
                if (isFromMenu) {
                    _this.menu.close();
                }
            });
        }
        else {
            this.nav.push(page.component).then(function () {
                if (isFromMenu) {
                    _this.menu.close();
                }
            });
        }
    };
    topTeamerApp.prototype.initApp = function () {
        //TODO: Global Exception handler - to write to flurry
        //TODO: Global page change detection to report to flurry about page navigations
        //TODO: Catch resume on mobile and call initBranch again
        //TODO: Catch http 401 errors and re-login
        //TODO: Catch server popup messages and display a modal popup.
        //TODO: Flurry events
        var _this = this;
        this.platform.ready().then(function () {
            _this.declareStringFormat();
            _this.declareRequestAnimationFrame();
            _this.initFlurry();
            if (!window.cordova) {
                _this.initWeb();
            }
            else {
                _this.initMobile();
            }
            _this.initBranch();
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
            console.log("platform ready");
        });
    };
    ;
    topTeamerApp.prototype.initWeb = function () {
        var _this = this;
        //Resize app for web
        var containerWidth = window.innerWidth;
        var myApp = document.getElementById("myApp");
        if (myApp) {
            if (containerWidth > this.server.settings.general.webCanvasWidth) {
                myApp.style.width = this.server.settings.general.webCanvasWidth + "px";
                myApp.style.marginLeft = (containerWidth - this.server.settings.general.webCanvasWidth) / 2 + "px";
            }
        }
        //init facebook javascript sdk
        window.fbAsyncInit = function () {
            FB.init({
                appId: '344342552056',
                xfbml: true,
                version: 'v2.5'
            });
            _this.initFacebook();
        };
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    };
    topTeamerApp.prototype.initMobile = function () {
        var _this = this;
        if (cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        //Must be set manually for keyboard issue when opened - to scroll elements of the focused field
        this.app.platform.isFullScreen = true;
        //Hook into window.open
        window.open = cordova.InAppBrowser.open;
        //Load branch mobile script
        loadJsFile("lib/branch/moblie.min.js");
        //Init android billing
        if (this.platform.is('android') && typeof inappbilling !== "undefined") {
            inappbilling.init(function (resultInit) {
            }, function (errorInit) {
                FlurryAgent.myLogError("InAppBilling", errorInit);
            }, { showLog: true }, []);
        }
        cordova.getAppVersion(function (version) {
            server.user.clientInfo.appVersion = version;
            FlurryAgent.setAppVersion("" + version);
            _this.initFacebook();
        });
    };
    topTeamerApp.prototype.initFlurry = function () {
        //FlurryAgent.setDebugLogEnabled(true);
        FlurryAgent.startSession("NT66P8Q5BR5HHVN2C527");
        FlurryAgent.myLogError = function (errorType, message) {
            console.log(message);
            FlurryAgent.logError(errorType.substring(0, 255), message.substring(0, 255), 0);
        };
    };
    topTeamerApp.prototype.initBranch = function () {
        window.myHandleBranch = function (err, data) {
            try {
                if (err) {
                    FlurryAgent.myLogError("BranchIoError", "Error received during branch init: " + err);
                    return;
                }
                if (data.data_parsed && data.data_parsed.contestId) {
                    //Will go to this contest
                    server.deepLinkContestId = data.data_parsed.contestId;
                }
            }
            catch (e) {
                FlurryAgent.myLogError("BranchIoError", "Error parsing data during branch init, data= " + data + ", parsedData=" + parsedData + ", error: " + e);
            }
            window.initBranch = function () {
                branch.init("key_live_pocRNjTcwzk0YWxsqcRv3olivweLVuVE", function (err, data) {
                    if (window.myHandleBranch) {
                        window.myHandleBranch(err, data);
                    }
                });
            };
        };
    };
    topTeamerApp.prototype.initFacebook = function () {
        var _this = this;
        facebookService.getLoginStatus().then(function (result) {
            if (result.connected) {
                _this.server.facebookConnect(result.response.authResponse).then(function () {
                    _this.openPage(tabs_1.TabsPage, true, false);
                });
            }
            else {
                _this.openPage(login_1.LoginPage, true, false);
            }
        });
    };
    topTeamerApp.prototype.declareRequestAnimationFrame = function () {
        // Fallback where requestAnimationFrame or its equivalents are not supported in the current browser
        window.myRequestAnimationFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    };
    topTeamerApp.prototype.declareStringFormat = function () {
        if (!String.prototype.format) {
            String.prototype.format = function () {
                var args = arguments;
                var str = this;
                function replaceByObjectProperies(obj) {
                    for (var property in obj)
                        if (obj.hasOwnProperty(property))
                            //replace all instances case-insensitive
                            str = str.replace(new RegExp(escapeRegExp("{{" + property + "}}"), 'gi'), String(obj[property]));
                }
                function escapeRegExp(string) {
                    return string.replace(/([.*+?^=!:${{}}()|\[\]\/\\])/g, "\\$1");
                }
                function replaceByArray(arrayLike) {
                    for (var i = 0, len = arrayLike.length; i < len; i++)
                        str = str.replace(new RegExp(escapeRegExp("{{" + i + "}}"), 'gi'), String(arrayLike[i]));
                }
                if (!arguments.length || arguments[0] === null || arguments[0] === undefined)
                    return str;
                else if (arguments.length == 1 && Array.isArray(arguments[0]))
                    replaceByArray(arguments[0]);
                else if (arguments.length == 1 && typeof arguments[0] === "object")
                    replaceByObjectProperies(arguments[0]);
                else
                    replaceByArray(arguments);
                return str;
            };
        }
    };
    topTeamerApp = __decorate([
        ionic_1.App({
            templateUrl: 'app.html',
            moduleId: 'build/app.html',
            providers: [server_1.Server]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ionic_1.IonicApp !== 'undefined' && ionic_1.IonicApp) === 'function' && _a) || Object, (typeof (_b = typeof ionic_1.Platform !== 'undefined' && ionic_1.Platform) === 'function' && _b) || Object, server_1.Server])
    ], topTeamerApp);
    return topTeamerApp;
    var _a, _b;
})();
