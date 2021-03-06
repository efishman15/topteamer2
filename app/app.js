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
var exceptions_1 = require('./providers/exceptions');
var ionic_angular_1 = require('ionic-angular');
var client_1 = require('./providers/client');
var connectService = require('./providers/connect');
var contestsService = require('./providers/contests');
var shareService = require('./providers/share');
var loading_modal_1 = require('./components/loading-modal/loading-modal');
var player_info_1 = require('./components/player-info/player-info');
var analyticsService = require('./providers/analytics');
var alertService = require('./providers/alert');
var ionic_native_1 = require('ionic-native');
var objects_1 = require('./objects/objects');
var TopTeamerApp = (function () {
    function TopTeamerApp(app, platform, config, client, events, alertController, modalController, menuController) {
        this.app = app;
        this.platform = platform;
        this.config = config;
        this.client = client;
        this.events = events;
        this.alertController = alertController;
        this.modalController = modalController;
        this.menuController = menuController;
    }
    TopTeamerApp.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.client.init(this.app, this.platform, this.config, this.events, this.nav, this.alertController, this.modalController, this.loadingModalComponent, this.playerInfoComponent).then(function () {
            _this.initApp();
        }, function (err) { return _this.ngAfterViewInit(); });
    };
    TopTeamerApp.prototype.initApp = function () {
        //TODO: navigate to PurchaseSuccess based on url params (if coming from paypal)
        var _this = this;
        this.client.platform.ready().then(function () {
            _this.expandStringPrototype();
            _this.declareRequestAnimationFrame();
            _this.expandDatePrototype();
            _this.initAnalytics();
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
            _this.client.platform.registerBackButtonAction(function () {
                var client = client_1.Client.getInstance();
                //Check if modal view is displayed, currently accessing non-public members of Ionic App
                //Waiting for Ionic team to expose checking if a modal view is displayed
                if (_this.app['_portal']._views && _this.app['_portal']._views.length > 0 && _this.app['_portal']._views[0].isOverlay) {
                    return _this.app['_portal']._views[0].dismiss();
                }
                //Root screen - confirm exit app
                if (!client.nav.canGoBack()) {
                    if (_this.menuController.isOpen()) {
                        //if main menu is opened - back will close it
                        return _this.menuController.close();
                    }
                    else {
                        //Main menu is closed - confirm exit app
                        return alertService.confirmExitApp();
                    }
                }
                //Go back
                return client.nav.pop();
            });
        }, function () {
        });
    };
    ;
    TopTeamerApp.prototype.initWeb = function () {
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
                appId: _this.client.settings.facebook.appId,
                xfbml: true,
                cookie: true,
                version: _this.client.settings.facebook.version
            });
            _this.initLoginState();
        };
        (function (d, s, id) {
            var client = client_1.Client.getInstance();
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = client.settings.facebook.sdk;
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    };
    TopTeamerApp.prototype.initMobile = function () {
        var _this = this;
        //Will discover which apps are installed (from a server list) and support sharing
        shareService.mobileDiscoverSharingApps();
        if (window.cordova.plugins.Keyboard) {
            window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            window.cordova.plugins.Keyboard.disableScroll(false);
        }
        //Hook into window.open
        window.open = window.cordova.InAppBrowser.open;
        //Load branch mobile script
        window.loadJsFile('lib/branch/moblie.min.js');
        //Init android billing
        if (this.client.platform.is('android') && typeof window.inappbilling !== 'undefined') {
            window.inappbilling.init(function (resultInit) {
            }, function (errorInit) {
                analyticsService.logError('InAppBilling', errorInit);
            }, { showLog: true }, []);
        }
        document.addEventListener('resume', function (event) {
            if (window.initBranch) {
                window.initBranch();
            }
        });
        ionic_native_1.AppVersion.getVersionNumber().then(function (version) {
            _this.client.user.clientInfo.appVersion = version;
            //The app version property will be sent on each event tracking
            analyticsService.register({ appVersion: version });
            _this.initLoginState();
        }, function () {
        });
    };
    TopTeamerApp.prototype.initAnalytics = function () {
        analyticsService.init(this.client.settings.analytics.mixpanel.token);
    };
    TopTeamerApp.prototype.initBranch = function () {
        var _this = this;
        window.myHandleBranch = function (err, data) {
            try {
                if (err) {
                    analyticsService.logError('BranchIoError', err);
                    return;
                }
                if (data.data_parsed && data.data_parsed.contestId) {
                    //Will go to this contest
                    if (_this.client.session && _this.client.nav && _this.client.nav.length() > 0) {
                        _this.client.displayContestById(data.data_parsed.contestId);
                    }
                    else {
                        //Will be displayed on the first posibility
                        _this.client.deepLinkContestId = data.data_parsed.contestId;
                    }
                }
            }
            catch (e) {
                analyticsService.logError('BranchIoParseDataError', { data: data, error: e });
            }
        };
        window.initBranch = function () {
            if (window.branch) {
                window.branch.init(_this.client.settings.branch.key, function (err, data) {
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
    TopTeamerApp.prototype.initLoginState = function () {
        var _this = this;
        connectService.getLoginStatus().then(function (connectInfo) {
            if (_this.client.hasCredentials(connectInfo)) {
                _this.client.serverConnect(connectInfo).then(function () {
                    connectService.storeCredentials(connectInfo);
                    _this.playerInfoComponent.init(_this.client);
                    var appPages = new Array();
                    appPages.push(new objects_1.AppPage('MainTabsPage', {}));
                    if (_this.client.deepLinkContestId) {
                        contestsService.getContest(_this.client.deepLinkContestId).then(function (contest) {
                            _this.client.deepLinkContestId = null;
                            appPages.push(new objects_1.AppPage('ContestPage', { 'contest': contest, 'source': 'deepLink' }));
                            _this.client.setPages(appPages).then(function () {
                                _this.client.hidePreloader();
                            }, function () {
                            });
                        });
                    }
                    else {
                        _this.client.setPages(appPages).then(function () {
                            _this.client.hidePreloader();
                        }, function () {
                        });
                    }
                }, function () {
                    _this.client.nav.setRoot(_this.client.getPage('LoginPage'));
                });
            }
            else {
                _this.client.nav.setRoot(_this.client.getPage('LoginPage'));
            }
        }, function () {
            _this.client.nav.setRoot(_this.client.getPage('LoginPage'));
        });
    };
    TopTeamerApp.prototype.declareRequestAnimationFrame = function () {
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
    TopTeamerApp.prototype.expandStringPrototype = function () {
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
    TopTeamerApp.prototype.expandDatePrototype = function () {
        if (!Date.prototype.clearTime) {
            Date.prototype.clearTime = function () {
                this.setHours(0);
                this.setMinutes(0);
                this.setSeconds(0);
                this.setMilliseconds(0);
            };
        }
    };
    TopTeamerApp.prototype.newContest = function () {
        analyticsService.track('menu/newContest');
        this.client.openNewContest();
    };
    TopTeamerApp.prototype.share = function () {
        analyticsService.track('menu/share');
        this.client.share(null, 'menu');
    };
    TopTeamerApp.prototype.like = function () {
        analyticsService.track('like/click');
        window.open(this.client.settings.general.facebookFanPage, '_new');
    };
    TopTeamerApp.prototype.settings = function () {
        analyticsService.track('menu/settings');
        this.client.openPage('SettingsPage');
    };
    TopTeamerApp.prototype.systemTools = function () {
        analyticsService.track('menu/systemTools');
        this.client.openPage('SystemToolsPage');
    };
    __decorate([
        core_1.ViewChild(ionic_angular_1.Nav), 
        __metadata('design:type', ionic_angular_1.Nav)
    ], TopTeamerApp.prototype, "nav", void 0);
    __decorate([
        core_1.ViewChild(loading_modal_1.LoadingModalComponent), 
        __metadata('design:type', loading_modal_1.LoadingModalComponent)
    ], TopTeamerApp.prototype, "loadingModalComponent", void 0);
    __decorate([
        core_1.ViewChild(player_info_1.PlayerInfoComponent), 
        __metadata('design:type', player_info_1.PlayerInfoComponent)
    ], TopTeamerApp.prototype, "playerInfoComponent", void 0);
    TopTeamerApp = __decorate([
        core_1.Component({
            templateUrl: 'build/app.html',
            directives: [loading_modal_1.LoadingModalComponent, player_info_1.PlayerInfoComponent]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.App, ionic_angular_1.Platform, ionic_angular_1.Config, client_1.Client, ionic_angular_1.Events, ionic_angular_1.AlertController, ionic_angular_1.ModalController, ionic_angular_1.MenuController])
    ], TopTeamerApp);
    return TopTeamerApp;
})();
exports.TopTeamerApp = TopTeamerApp;
ionic_angular_1.ionicBootstrap(TopTeamerApp, [core_1.provide(core_1.ExceptionHandler, { useClass: exceptions_1.MyExceptionHandler }), client_1.Client], {
    backButtonText: '', prodMode: true, navExitApp: false
});
//# sourceMappingURL=app.js.map