var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var exceptions_1 = require('./providers/exceptions');
var ionic_angular_1 = require('ionic-angular');
var main_tabs_1 = require('./pages/main-tabs/main-tabs');
var login_1 = require('./pages/login/login');
var facebookService = require('./providers/facebook');
var shareService = require('./providers/share');
var client_1 = require('./providers/client');
var contest_type_1 = require('./pages/contest-type/contest-type');
var set_contest_1 = require('./pages/set-contest/set-contest');
var settings_1 = require('./pages/settings/settings');
var system_tools_1 = require('./pages/system-tools/system-tools');
var contestsService = require('./providers/contests');
var topTeamerApp = (function () {
    function topTeamerApp(ionicApp, platform, config, client, events, menuController) {
        var _this = this;
        this.client = client;
        client.init(ionicApp, platform, config, menuController, events).then(function () {
            _this.initApp();
        });
    }
    topTeamerApp.prototype.initApp = function () {
        //TODO: Hardware back button
        //TODO: navigate to PurchaseSuccess based on url params (if coming from paypal)
        //TODO: Make .ts errors compile by definining classes in objects/objects.ts
        var _this = this;
        this.client.platform.ready().then(function () {
            _this.expandStringPrototype();
            _this.declareRequestAnimationFrame();
            _this.expandDatePrototype();
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
            _this.client.showSpinner = false;
            console.log('platform ready');
        });
    };
    ;
    topTeamerApp.prototype.initWeb = function () {
        var _this = this;
        //Resize app for web
        var containerWidth = window.innerWidth;
        var myApp = document.getElementById('myApp');
        if (myApp) {
            if (containerWidth > this.client.settings.general.webCanvasWidth) {
                myApp.style.width = this.client.settings.general.webCanvasWidth + 'px';
                myApp.style.marginLeft = (containerWidth - this.client.settings.general.webCanvasWidth) / 2 + 'px';
            }
        }
        //Load branch mobile script
        loadJsFile('lib/branch/web.min.js');
        //init facebook javascript sdk
        window.fbAsyncInit = function () {
            FB.init({
                appId: '344342552056',
                xfbml: true,
                cookie: true,
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
            js.src = '//connect.facebook.net/en_US/sdk.js';
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    };
    topTeamerApp.prototype.initMobile = function () {
        var _this = this;
        if (cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        //Must be set manually for keyboard issue when opened - to scroll elements of the focused field
        this.client.platform.prototype.fullScreen = function () {
            return true;
        };
        //Hook into window.open
        window.open = cordova.InAppBrowser.open;
        //Load branch mobile script
        loadJsFile('lib/branch/moblie.min.js');
        //Init android billing
        if (this.client.platform.is('android') && typeof inappbilling !== 'undefined') {
            inappbilling.init(function (resultInit) {
            }, function (errorInit) {
                _this.client.logError('InAppBilling', errorInit);
            }, { showLog: true }, []);
        }
        document.addEventListener('resume', function (event) {
            if (window.initBranch) {
                window.initBranch();
            }
        });
        cordova.getAppVersion(function (version) {
            _this.client.user.clientInfo.appVersion = version;
            FlurryAgent.setAppVersion('' + version);
            _this.initFacebook();
        });
    };
    topTeamerApp.prototype.initFlurry = function () {
        //FlurryAgent.setDebugLogEnabled(true);
        FlurryAgent.startSession('NT66P8Q5BR5HHVN2C527');
    };
    topTeamerApp.prototype.initBranch = function () {
        var _this = this;
        window.myHandleBranch = function (err, data) {
            try {
                if (err) {
                    _this.client.logError('BranchIoError', 'Error received during branch init: ' + err);
                    return;
                }
                if (data.data_parsed && data.data_parsed.contestId) {
                    //Will go to this contest
                    //TODO: QA - Deep linking
                    _this.deepLinkContestId = data.data_parsed.contestId;
                }
            }
            catch (e) {
                _this.client.logError('BranchIoError', 'Error parsing data during branch init, data= ' + data + ', parsedData=' + data.data_parsed + ', error: ' + e);
            }
        };
        window.initBranch = function () {
            branch.init('key_live_pocRNjTcwzk0YWxsqcRv3olivweLVuVE', function (err, data) {
                if (window.myHandleBranch) {
                    window.myHandleBranch(err, data);
                }
            });
        };
        //Give the appropriate mobile/web branch js file time to load
        setTimeout(function () {
            window.initBranch();
        }, 1000);
    };
    topTeamerApp.prototype.initFacebook = function () {
        var _this = this;
        facebookService.getLoginStatus().then(function (result) {
            if (result.connected) {
                _this.client.facebookServerConnect(result.response.authResponse).then(function () {
                    _this.client.nav.push(main_tabs_1.MainTabsPage).then(function () {
                        if (_this.deepLinkContestId) {
                            contestsService.openContest(_this.deepLinkContestId);
                        }
                    });
                });
            }
            else {
                _this.client.nav.push(login_1.LoginPage);
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
    topTeamerApp.prototype.expandStringPrototype = function () {
        if (!String.prototype.format) {
            String.prototype.format = function () {
                var args = arguments;
                var str = this;
                function replaceByObjectProperies(obj) {
                    for (var property in obj)
                        if (obj.hasOwnProperty(property))
                            //replace all instances case-insensitive
                            str = str.replace(new RegExp(escapeRegExp('{{' + property + '}}'), 'gi'), String(obj[property]));
                }
                function escapeRegExp(string) {
                    return string.replace(/([.*+?^=!:${{}}()|\[\]\/\\])/g, '\\$1');
                }
                function replaceByArray(arrayLike) {
                    for (var i = 0, len = arrayLike.length; i < len; i++)
                        str = str.replace(new RegExp(escapeRegExp('{{' + i + '}}'), 'gi'), String(arrayLike[i]));
                }
                if (!arguments.length || arguments[0] === null || arguments[0] === undefined)
                    return str;
                else if (arguments.length == 1 && Array.isArray(arguments[0]))
                    replaceByArray(arguments[0]);
                else if (arguments.length == 1 && typeof arguments[0] === 'object')
                    replaceByObjectProperies(arguments[0]);
                else
                    replaceByArray(arguments);
                return str;
            };
        }
        if (!String.prototype.replaceAll) {
            String.prototype.replaceAll = function (search, replacement) {
                var target = this;
                return target.replace(new RegExp(search, 'g'), replacement);
            };
        }
    };
    topTeamerApp.prototype.expandDatePrototype = function () {
        if (!Date.prototype.clearTime) {
            Date.prototype.clearTime = function () {
                this.setHours(0);
                this.setMinutes(0);
                this.setSeconds(0);
                this.setMilliseconds(0);
            };
        }
    };
    topTeamerApp.prototype.newContest = function () {
        var _this = this;
        this.client.logEvent('menu/newContest');
        var modal = ionic_angular_1.Modal.create(contest_type_1.ContestTypePage);
        modal.onDismiss(function (contestType) {
            if (contestType) {
                setTimeout(function () {
                    _this.client.nav.push(set_contest_1.SetContestPage, { 'mode': 'add', 'type': contestType });
                }, 500);
            }
        });
        this.client.nav.present(modal);
    };
    topTeamerApp.prototype.share = function () {
        this.client.logEvent('menu/share');
        shareService.share('menu');
    };
    topTeamerApp.prototype.settings = function () {
        this.client.logEvent('menu/settings');
        this.client.nav.push(settings_1.SettingsPage);
    };
    topTeamerApp.prototype.systemTools = function () {
        this.client.logEvent('menu/systemTools');
        this.client.nav.push(system_tools_1.SystemToolsPage);
    };
    topTeamerApp = __decorate([
        ionic_angular_1.App({
            templateUrl: 'app.html',
            moduleId: 'build/app.html',
            providers: [core_1.provide(core_1.ExceptionHandler, { useClass: exceptions_1.MyExceptionHandler }), client_1.Client],
            config: { backButtonText: '' }
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.IonicApp, ionic_angular_1.Platform, ionic_angular_1.Config, client_1.Client, ionic_angular_1.Events, ionic_angular_1.MenuController])
    ], topTeamerApp);
    return topTeamerApp;
})();
