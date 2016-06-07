var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var ionic_angular_1 = require('ionic-angular');
var client_1 = require('./providers/client');
var facebookService = require('./providers/facebook');
var shareService = require('./providers/share');
var loading_modal_1 = require('./components/loading-modal/loading-modal');
var alertService = require('./providers/alert');
var ionic_native_1 = require('ionic-native');
var topTeamerApp = (function () {
    function topTeamerApp(ionicApp, platform, config, client, events, menuController) {
        ionicApp.setProd(true);
        this.ionicApp = ionicApp;
        this.platform = platform;
        this.config = config;
        this.client = client;
        this.events = events;
        this.menuController = menuController;
    }
    topTeamerApp.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.client.init(this.ionicApp, this.platform, this.config, this.menuController, this.events, this.nav, this.loadingModalComponent).then(function () {
            _this.initApp();
        });
    };
    topTeamerApp.prototype.initApp = function () {
        //TODO: Hardware back button
        //TODO: navigate to PurchaseSuccess based on url params (if coming from paypal)
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
                window.StatusBar.styleDefault();
            }
            //Handle hardware back button
            document.addEventListener('backbutton', function (event) {
                event.cancelBubble = true;
                event.preventDefault();
                var client = client_1.Client.getInstance();
                var activeNav = client.nav;
                var activeView = activeNav.getActive();
                if (activeView) {
                    if (!activeView.isRoot()) {
                        return activeView.dismiss();
                    }
                    var page = activeView.instance;
                    if (page instanceof client.getPage('MainTabsPage') && page['mainTabs']) {
                        activeNav = page['mainTabs'].getSelected();
                    }
                }
                if (activeNav.canGoBack()) {
                    // Detected a back button press outside of tabs page - popping a view from a navigation stack.
                    return activeNav.pop();
                }
                // Exiting app due to back button press at the root view
                return alertService.confirmExitApp();
            }, false);
            _this.client.hideLoader();
            console.log('platform ready');
        });
    };
    ;
    topTeamerApp.prototype.initWeb = function () {
        var _this = this;
        window.addEventListener('resize', function (event) {
            var client = client_1.Client.getInstance();
            client.resizeWeb();
        });
        this.client.resizeWeb();
        //Load branch mobile script
        window.loadJsFile('lib/branch/web.min.js');
        //init facebook javascript sdk
        window.fbAsyncInit = function () {
            window.FB.init({
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
        if (window.cordova.plugins.Keyboard) {
            window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            window.cordova.plugins.Keyboard.disableScroll(false);
        }
        //Must be set manually for keyboard issue when opened - to scroll elements of the focused field
        //TODO: check if Platform.prototype.fullScreen is required - to return true always
        //Hook into window.open
        window.open = window.cordova.InAppBrowser.open;
        //Load branch mobile script
        window.loadJsFile('lib/branch/moblie.min.js');
        //Init android billing
        if (this.client.platform.is('android') && typeof window.inappbilling !== 'undefined') {
            window.inappbilling.init(function (resultInit) {
            }, function (errorInit) {
                window.myLogError('InAppBilling', errorInit);
            }, { showLog: true }, []);
        }
        document.addEventListener('resume', function (event) {
            if (window.initBranch) {
                window.initBranch();
            }
        });
        ionic_native_1.AppVersion.getVersionNumber().then(function (version) {
            _this.client.user.clientInfo.appVersion = version;
            window.FlurryAgent.setAppVersion('' + version);
            _this.initFacebook();
        });
    };
    topTeamerApp.prototype.initFlurry = function () {
        //FlurryAgent.setDebugLogEnabled(true);
        window.FlurryAgent.startSession('NT66P8Q5BR5HHVN2C527');
        window.myLogError = function (errorType, message) {
            window.FlurryAgent.logError(errorType.substring(0, 255), message.substring(0, 255), 0);
        };
    };
    topTeamerApp.prototype.initBranch = function () {
        var _this = this;
        window.myHandleBranch = function (err, data) {
            try {
                if (err) {
                    window.myLogError('BranchIoError', 'Error received during branch init: ' + err);
                    return;
                }
                if (data.data_parsed && data.data_parsed.contestId) {
                    //Will go to this contest
                    //TODO: QA - Deep linking
                    _this.deepLinkContestId = data.data_parsed.contestId;
                    console.log('got contest id: ' + _this.deepLinkContestId);
                }
            }
            catch (e) {
                window.myLogError('BranchIoError', 'Error parsing data during branch init, data= ' + data + ', parsedData=' + data.data_parsed + ', error: ' + e);
            }
        };
        window.initBranch = function () {
            if (window.branch) {
                window.branch.init('key_live_pocRNjTcwzk0YWxsqcRv3olivweLVuVE', function (err, data) {
                    if (window.myHandleBranch) {
                        window.myHandleBranch(err, data);
                    }
                });
            }
            else {
                console.log('branch script not loaded - retrying in 2000 ms.');
                setTimeout(function () {
                    window.initBranch();
                }, 2000);
            }
        };
        //Give the appropriate mobile/web branch js file time to load
        setTimeout(function () {
            window.initBranch();
        }, 2000);
    };
    topTeamerApp.prototype.initFacebook = function () {
        var _this = this;
        facebookService.getLoginStatus().then(function (result) {
            if (result['connected']) {
                _this.client.facebookServerConnect(result['response'].authResponse).then(function () {
                    _this.client.setRootPage('MainTabsPage').then(function () {
                        if (_this.deepLinkContestId) {
                            _this.client.displayContest(_this.deepLinkContestId);
                        }
                    });
                });
            }
            else {
                _this.client.openPage('LoginPage');
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
    topTeamerApp.prototype.share = function () {
        this.client.logEvent('menu/share');
        shareService.share('menu');
    };
    topTeamerApp.prototype.settings = function () {
        this.client.logEvent('menu/settings');
        this.client.openPage('SettingsPage');
    };
    topTeamerApp.prototype.systemTools = function () {
        this.client.logEvent('menu/systemTools');
        this.client.openPage('SystemToolsPage');
    };
    __decorate([
        core_1.ViewChild(ionic_angular_1.Nav), 
        __metadata('design:type', ionic_angular_1.Nav)
    ], topTeamerApp.prototype, "nav", void 0);
    __decorate([
        core_1.ViewChild(loading_modal_1.LoadingModalComponent), 
        __metadata('design:type', loading_modal_1.LoadingModalComponent)
    ], topTeamerApp.prototype, "loadingModalComponent", void 0);
    topTeamerApp = __decorate([
        ionic_angular_1.App({
            templateUrl: 'build/app.html',
            providers: [client_1.Client],
            config: { backButtonText: '' },
            directives: [loading_modal_1.LoadingModalComponent]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.IonicApp, ionic_angular_1.Platform, ionic_angular_1.Config, client_1.Client, ionic_angular_1.Events, ionic_angular_1.MenuController])
    ], topTeamerApp);
    return topTeamerApp;
})();
//# sourceMappingURL=app.js.map