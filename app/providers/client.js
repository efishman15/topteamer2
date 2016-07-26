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
var http_1 = require('@angular/http');
require('rxjs/add/operator/map');
require('rxjs/add/operator/timeout');
var ionic_native_1 = require('ionic-native');
var ionic_angular_1 = require('ionic-angular');
var contestsService = require('./contests');
var facebookService = require('./facebook');
var alertService = require('./alert');
var objects_1 = require('../objects/objects');
var classesService = require('./classes');
var Client = (function () {
    function Client(http) {
        this.circle = Math.PI * 2;
        this.quarter = Math.PI / 2;
        this._loaded = false;
        this.appPreloading = true;
        if (Client.instance) {
            throw new Error('You can\'t call new in Singleton instances! Call Client.getInstance() instead.');
        }
        this.clientInfo = new objects_1.ClientInfo();
        if (!window.cordova) {
            this.clientInfo.mobile = false;
            if (window.self !== window.top) {
                this.clientInfo.platform = 'facebook';
            }
            else {
                this.clientInfo.platform = 'web';
            }
        }
        else {
            this.clientInfo.mobile = true;
        }
        this.serverGateway = new ServerGateway(http);
    }
    Client.getInstance = function () {
        if (Client.instance == null) {
            Client.instance = this;
        }
        return Client.instance;
    };
    Client.prototype.init = function (app, platform, config, events, nav, loadingModalComponent) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._app = app;
            _this._platform = platform;
            _this._config = config;
            _this._events = events;
            _this._nav = nav;
            _this.loadingModalComponent = loadingModalComponent;
            if (_this.clientInfo.mobile) {
                _this._shareApps = new Array();
                if (platform.is('android')) {
                    _this.clientInfo.platform = 'android';
                }
                else if (platform.is('ios')) {
                    _this.clientInfo.platform = 'ios';
                }
            }
            var language = localStorage.getItem('language');
            _this.getSettings(language).then(function (data) {
                _this._settings = data['settings'];
                if (!language || language === 'undefined') {
                    //Language was computed on the server using geoInfo or the fallback to the default language
                    language = data['language'];
                    localStorage.setItem('language', language);
                }
                _this.initUser(language, data['geoInfo']);
                _this.canvas = document.getElementById('playerInfoRankCanvas');
                _this._canvasContext = _this.canvas.getContext('2d');
                _this.setDirection();
                _this._loaded = true;
                _this.adjustChartsDeviceSettings();
                Client.instance = _this;
                resolve();
            }, function (err) { return reject(err); });
        });
    };
    Client.prototype.initPlayerInfo = function () {
        var navBar = document.getElementsByTagName('ion-navbar')[0];
        var navBarHeight = navBar['offsetHeight'];
        var playerInfoImage = document.getElementById('playerInfoImage');
        playerInfoImage.style.top = (navBarHeight - playerInfoImage.offsetHeight) / 2 + 'px';
        //Player info rank canvas
        this.canvasCenterX = this.settings.xpControl.canvas.width / 2;
        this.canvasCenterY = this.settings.xpControl.canvas.height / 2;
        this.canvas.width = this.settings.xpControl.canvas.width;
        this.canvas.style.width = this.settings.xpControl.canvas.width + 'px';
        this.canvas.height = this.settings.xpControl.canvas.height;
        this.canvas.style.height = this.settings.xpControl.canvas.height + 'px';
        this.canvas.style.top = (navBarHeight - this.settings.xpControl.canvas.height) / 2 + 'px';
    };
    Client.prototype.getSettings = function (localStorageLanguage) {
        var postData = { 'clientInfo': this.clientInfo };
        if (localStorageLanguage && localStorageLanguage !== 'undefined') {
            //This will indicate to the server NOT to retrieve geo info - since language is already determined
            postData['language'] = localStorageLanguage;
        }
        else {
            //Server will try to retrieve geo info based on client ip - if fails - will revert to this default language
            postData['defaultLanguage'] = this.getDefaultLanguage();
        }
        return this.serverPost('info/settings', postData);
    };
    Client.prototype.initUser = function (language, geoInfo) {
        this._user = new objects_1.User(language, this.clientInfo, geoInfo);
    };
    Client.prototype.clearXp = function () {
        this._canvasContext.clearRect(0, 0, this.settings.xpControl.canvas.width, this.settings.xpControl.canvas.height);
    };
    Client.prototype.initXp = function () {
        this.clearXp();
        //-------------------------------------------------------------------------------------
        // Draw the full circle representing the entire xp required for the next level
        //-------------------------------------------------------------------------------------
        this._canvasContext.beginPath();
        this._canvasContext.arc(this.canvasCenterX, this.canvasCenterY, this.settings.xpControl.radius, 0, this.circle, false);
        this._canvasContext.fillStyle = this.settings.xpControl.fillColor;
        this._canvasContext.fill();
        //Full line color
        this._canvasContext.lineWidth = this.settings.xpControl.lineWidth;
        this._canvasContext.strokeStyle = this.settings.xpControl.fullLineColor;
        this._canvasContext.stroke();
        this._canvasContext.closePath();
        //-------------------------------------------------------------------------------------
        //Draw the arc representing the xp in the current level
        //-------------------------------------------------------------------------------------
        this._canvasContext.beginPath();
        // line color
        this._canvasContext.arc(this.canvasCenterX, this.canvasCenterY, this.settings.xpControl.radius, -(this.quarter), ((this.session.xpProgress.current / this.session.xpProgress.max) * this.circle) - this.quarter, false);
        this._canvasContext.strokeStyle = this.settings.xpControl.progressLineColor;
        this._canvasContext.stroke();
        //Rank Text
        var font = '';
        if (this.settings.xpControl.font.bold) {
            font += 'bold ';
        }
        var fontSize;
        if (this.session.rank < 10) {
            //1 digit font
            fontSize = this.settings.xpControl.font.d1;
        }
        else if (this.session.rank < 100) {
            //2 digits font
            fontSize = this.settings.xpControl.font.d2;
        }
        else {
            fontSize = this.settings.xpControl.font.d3;
        }
        font += fontSize + ' ';
        font += this.settings.xpControl.font.name;
        this._canvasContext.font = font;
        // Move it down by half the text height and left by half the text width
        var rankText = '' + this.session.rank;
        var textWidth = this._canvasContext.measureText(rankText).width;
        var textHeight = this._canvasContext.measureText('w').width;
        this._canvasContext.fillStyle = this.settings.xpControl.textColor;
        this._canvasContext.fillText(rankText, this.canvasCenterX - (textWidth / 2), this.canvasCenterY + (textHeight / 2));
        this._canvasContext.closePath();
    };
    Client.prototype.animateXpAddition = function (startPoint, endPoint) {
        this._canvasContext.beginPath();
        this._canvasContext.arc(this.canvasCenterX, this.canvasCenterY, this.settings.xpControl.radius, (this.circle * startPoint) - this.quarter, (this.circle * endPoint) - this.quarter, false);
        this._canvasContext.strokeStyle = this.settings.xpControl.progressLineColor;
        this._canvasContext.stroke();
        this._canvasContext.closePath();
    };
    Client.prototype.addXp = function (xpProgress) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var startPoint = _this.session.xpProgress.current / _this.session.xpProgress.max;
            //Occurs after xp has already been added to the session
            var addition = xpProgress.addition;
            for (var i = 1; i <= addition; i++) {
                window.myRequestAnimationFrame(function () {
                    var endPoint = (_this.session.xpProgress.current + i) / _this.session.xpProgress.max;
                    _this.animateXpAddition(startPoint, endPoint);
                    //Last iteration should be performed after the animation frame event happened
                    if (i >= addition) {
                        //Add the actual xp to the client side
                        _this.session.xpProgress = xpProgress;
                        //Zero the addition
                        _this.session.xpProgress.addition = 0;
                        if (xpProgress.rankChanged) {
                            _this.session.rank = xpProgress.rank;
                            _this.initXp();
                        }
                    }
                });
            }
            resolve();
        });
    };
    Client.prototype.setDirection = function () {
        var dir = document.createAttribute('dir');
        dir.value = this.currentLanguage.direction;
        this.nav.getElementRef().nativeElement.attributes.setNamedItem(dir);
        var playerInfo = document.getElementById('playerInfo');
        if (playerInfo) {
            playerInfo.className = 'player-info-' + this.currentLanguage.direction;
        }
        this.canvas.className = 'player-info-canvas-' + this.currentLanguage.direction;
        this.config.set('backButtonIcon', this.currentLanguage.backButtonIcon);
    };
    Client.prototype.facebookServerConnect = function (facebookAuthResponse) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.user.thirdParty) {
                _this.user.thirdParty = new objects_1.ThirdPartyInfo();
            }
            _this.user.thirdParty.type = 'facebook';
            _this.user.thirdParty.id = facebookAuthResponse.userID;
            _this.user.thirdParty.accessToken = facebookAuthResponse.accessToken;
            _this.serverPost('user/facebookConnect', { 'user': _this.user }).then(function (data) {
                if (_this.user.settings.language !== data['session'].settings.language) {
                    _this.user.settings.language = data['session'].settings.language;
                    _this.localSwitchLanguage(_this.user.settings.language);
                }
                _this.user.settings = JSON.parse(JSON.stringify(data['session'].settings));
                _this._session = data['session'];
                _this.serverGateway.token = data['session'].token;
                _this.setLoggedUserId(data['session'].userId);
                if (data['session'].justRegistered) {
                    _this.logEvent('server/register');
                }
                else {
                    _this.logEvent('server/login');
                }
                _this.initPushService();
                resolve();
            }, function (err) {
                reject(err);
            });
        });
    };
    ;
    Client.prototype.serverGet = function (path, timeout) {
        return this.serverGateway.get(path, timeout);
    };
    Client.prototype.serverPost = function (path, postData, timeout, blockUserInterface) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.showLoader();
            _this.serverGateway.post(path, postData, timeout, blockUserInterface).then(function (data) {
                _this.hideLoader();
                if (_this.nav && _this.nav.length() > 0) {
                    //GUI is initiated - process the events right away
                    _this.processInternalEvents();
                }
                resolve(data);
            }, function (err) {
                _this.hideLoader();
                if (err && err.httpStatus === 401) {
                    facebookService.getLoginStatus().then(function (result) {
                        if (result['connected']) {
                            _this.facebookServerConnect(result['response'].authResponse).then(function () {
                                return _this.serverPost(path, postData, timeout, blockUserInterface).then(function (data) {
                                    resolve(data);
                                }, function (err) {
                                    reject(err);
                                });
                            });
                        }
                        else {
                            facebookService.login(false).then(function (response) {
                                _this.facebookServerConnect(result['response'].authResponse).then(function () {
                                    return _this.serverPost(path, postData, timeout, blockUserInterface).then(function (data) {
                                        resolve(data);
                                    }, function (err) {
                                        reject(err);
                                    });
                                });
                            });
                        }
                    });
                }
                else if (err.httpStatus) {
                    //An error coming from our server
                    //Display an alert or confirm message and continue the reject so further 'catch' blocks
                    //will be invoked if any
                    if (!err.additionalInfo || !err.additionalInfo.confirm) {
                        alertService.alert(err).then(function () {
                            reject(err);
                        }, function () {
                            reject(err);
                        });
                    }
                    else {
                        var title = err.type + '_TITLE';
                        var message = err.type + '_MESSAGE';
                        alertService.confirm(title, message, err.params).then(function () {
                            err.additionalInfo.confirmed = true;
                            reject(err);
                        }, function () {
                            reject(err);
                        });
                    }
                }
                else {
                    alertService.alert({ 'type': 'SERVER_ERROR_GENERAL' }).then(function () {
                        reject(err);
                    }, function () {
                        reject(err);
                    });
                }
            });
        });
    };
    Client.prototype.processInternalEvents = function () {
        while (this.serverGateway.eventQueue.length > 0) {
            var internalEvent = this.serverGateway.eventQueue.shift();
            this.events.publish(internalEvent.eventName, internalEvent.eventData);
        }
    };
    Client.prototype.setPageTitle = function (key, params) {
        this.app.setTitle(this.translate(key, params));
    };
    Client.prototype.openNewContest = function () {
        var _this = this;
        this.logEvent('menu/newContest');
        var modal = this.createModalPage('ContestTypePage');
        modal.onDismiss(function (contestTypeId) {
            if (contestTypeId) {
                _this.openPage('SetContestPage', { 'mode': 'add', 'typeId': contestTypeId });
            }
        });
        return this.nav.present(modal);
    };
    Client.prototype.displayContestById = function (contestId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            contestsService.getContest(contestId).then(function (contest) {
                resolve(contest);
                _this.openPage('ContestPage', { 'contest': contest });
            }, function (err) {
                reject(err);
            });
        });
    };
    Client.prototype.showContest = function (contest, source, tryRun) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var now = (new Date()).getTime();
            var eventData = {
                'contestId': contest._id,
                'team': '' + contest.myTeam,
                'sourceClick': source
            };
            if (contest.state === 'play' && tryRun) {
                _this.logEvent('contest/play', eventData);
                //Joined to a contest - run it immediately (go to the quiz)
                var appPages = new Array();
                if (now - contest.lastUpdated < _this.settings.contest.refreshTresholdInMilliseconds) {
                    appPages.push(new objects_1.AppPage('ContestPage', { 'contest': contest }));
                    appPages.push(new objects_1.AppPage('QuizPage', { 'contest': contest, 'source': 'list' }));
                    _this.insertPages(appPages);
                    resolve();
                }
                else {
                    contestsService.getContest(contest._id).then(function (serverContest) {
                        resolve(serverContest);
                        appPages.push(new objects_1.AppPage('ContestPage', { 'contest': contest }));
                        appPages.push(new objects_1.AppPage('QuizPage', { 'contest': contest, 'source': 'list' }));
                        _this.insertPages(appPages);
                    }, function (err) {
                        reject(err);
                    });
                }
            }
            else if (now - contest.lastUpdated < _this.settings.contest.refreshTresholdInMilliseconds) {
                //Not joined and no refresh required - enter the contest with the object we have
                resolve();
                _this.logEvent('contest/show', eventData);
                _this.openPage('ContestPage', { 'contest': contest });
            }
            else {
                //Will enter the contest after retrieving it from the server
                _this.logEvent('contest/show', eventData);
                _this.displayContestById(contest._id).then(function (serverContest) {
                    resolve(serverContest);
                }, function (err) {
                    reject(err);
                });
            }
        });
    };
    Client.prototype.share = function (contest, source) {
        this.logEvent('share', { 'source': source });
        this.openPage('SharePage', { 'contest': contest, 'source': source });
    };
    Client.prototype.getPage = function (name) {
        return classesService.get(name);
    };
    Client.prototype.openPage = function (name, params) {
        return this.nav.push(classesService.get(name), params);
    };
    Client.prototype.createModalPage = function (name, params) {
        return ionic_angular_1.Modal.create(classesService.get(name), params);
    };
    Client.prototype.showModalPage = function (name, params) {
        var modal = this.createModalPage(name, params);
        return this.nav.present(modal);
    };
    Client.prototype.setRootPage = function (name, params) {
        return this.nav.setRoot(classesService.get(name), params);
    };
    Client.prototype.insertPages = function (pages, index) {
        if (index === undefined) {
            index = -1; //Will insert at the end of the stack
        }
        this.nav.insertPages(index, this.getNavPages(pages));
    };
    Client.prototype.setPages = function (pages) {
        return this.nav.setPages(this.getNavPages(pages));
    };
    Client.prototype.getNavPages = function (pages) {
        var _this = this;
        var navPages = new Array();
        pages.forEach(function (appPage) {
            navPages.push({ page: _this.getPage(appPage.page), params: appPage.params });
        });
        return navPages;
    };
    Client.prototype.hidePreloader = function () {
        this.appPreloading = false;
        document.body.className = 'app-loaded';
    };
    Client.prototype.resizeWeb = function () {
        //Resize app for web
        var containerWidth = window.innerWidth;
        var myApp = document.getElementById('myApp');
        if (myApp) {
            var minWidth = Math.min(containerWidth, this.settings.general.webCanvasWidth);
            this._width = minWidth;
            myApp.style.width = minWidth + 'px';
            myApp.style.marginLeft = (containerWidth - minWidth) / 2 + 'px';
        }
        this._chartWidth = null; //Will be recalculated upon first access to chartWidth property
        this._chartHeight = null; //Will be recalculated upon first access to chartHeight property
        //Invoke 'onResize' for each view that has it
        for (var i = 0; i < this.nav.length(); i++) {
            var viewController = this.nav.getByIndex(i);
            if (viewController && viewController.instance && viewController.instance['onResize']) {
                viewController.instance['onResize']();
            }
        }
    };
    Object.defineProperty(Client.prototype, "width", {
        get: function () {
            var innerWidth = window.innerWidth;
            if (this._width > 0 && this._width < innerWidth) {
                return this._width;
            }
            else {
                return innerWidth;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "height", {
        get: function () {
            return window.innerHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "chartWidth", {
        get: function () {
            if (!this._chartWidth) {
                this._chartWidth = this.width * this.settings.charts.contest.size.widthRatio;
            }
            return this._chartWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "chartHeight", {
        get: function () {
            if (!this._chartHeight) {
                this._chartHeight = this.width * this.settings.charts.contest.size.heightRatioFromWidth;
            }
            return this._chartHeight;
        },
        enumerable: true,
        configurable: true
    });
    Client.prototype.adjustChartsDeviceSettings = function () {
        //Contest charts
        for (var i = 0; i < this.settings.charts.contest.devices.length; i++) {
            if (window.devicePixelRatio <= this.settings.charts.contest.devices[i].devicePixelRatio) {
                this.settings.charts.contest.size.topMarginPercent = this.settings.charts.contest.devices[i].settings.topMarginPercent;
                this.settings.charts.contest.size.teamNameFontSize = this.settings.charts.contest.devices[i].settings.teamNameFontSize;
                break;
            }
        }
        //Question Stats charts
        for (var i = 0; i < this.settings.charts.questionStats.devices.length; i++) {
            if (window.devicePixelRatio <= this.settings.charts.questionStats.devices[i].devicePixelRatio) {
                this.settings.charts.questionStats.size.legendItemFontSize = this.settings.charts.questionStats.devices[i].settings.legendItemFontSize;
                this.settings.charts.questionStats.size.labelFontSize = this.settings.charts.questionStats.devices[i].settings.labelFontSize;
                break;
            }
        }
    };
    Client.prototype.showLoader = function () {
        var _this = this;
        if (this.loadingModalComponent && !this.appPreloading) {
            setTimeout(function () {
                _this.loadingModalComponent.show();
            }, 100);
        }
    };
    Client.prototype.hideLoader = function () {
        var _this = this;
        if (this.loadingModalComponent && !this.appPreloading) {
            setTimeout(function () {
                _this.loadingModalComponent.hide();
            }, 100);
        }
    };
    Object.defineProperty(Client.prototype, "shareApps", {
        get: function () {
            return this._shareApps;
        },
        set: function (value) {
            this._shareApps = value;
        },
        enumerable: true,
        configurable: true
    });
    Client.prototype.popToRoot = function () {
        if (this.nav.canGoBack()) {
            this.nav.popToRoot();
        }
    };
    Client.prototype.getDefaultLanguage = function () {
        //Always return a language - get the browser's language
        var language = window.navigator.languages ? navigator.languages[0].toString() : (navigator.language || navigator.userLanguage);
        if (!language) {
            language = 'en';
        }
        if (language.length > 2) {
            language = language.toLowerCase().substring(0, 2);
        }
        return language;
    };
    Object.defineProperty(Client.prototype, "loaded", {
        get: function () {
            return this._loaded;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "app", {
        get: function () {
            return this._app;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "platform", {
        get: function () {
            return this._platform;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "config", {
        get: function () {
            return this._config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "events", {
        get: function () {
            return this._events;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "nav", {
        get: function () {
            return this._nav;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "user", {
        get: function () {
            return this._user;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "endPoint", {
        get: function () {
            return this.serverGateway.endPoint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "settings", {
        get: function () {
            return this._settings;
        },
        set: function (value) {
            this._settings = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "session", {
        get: function () {
            return this._session;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "currentLanguage", {
        get: function () {
            return this.settings.languages[this.session ? this.session.settings.language : this.user.settings.language];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "languageKeys", {
        get: function () {
            if (!this._languageKeys) {
                this._languageKeys = Object.keys(this.settings.languages);
            }
            return this._languageKeys;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "canvasContext", {
        get: function () {
            return this._canvasContext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "deepLinkContestId", {
        get: function () {
            return this._deepLinkContestId;
        },
        set: function (value) {
            this._deepLinkContestId = value;
        },
        enumerable: true,
        configurable: true
    });
    Client.prototype.translate = function (key, params) {
        var language = (this.session ? this.session.settings.language : this.user.settings.language);
        var translatedValue = this.settings.ui[language][key];
        if (params) {
            translatedValue = translatedValue.format(params);
        }
        return translatedValue;
    };
    Client.prototype.toggleSettings = function (name) {
        var postData = { 'name': name };
        return this.serverPost('user/toggleSettings', postData);
    };
    Client.prototype.localSwitchLanguage = function (language) {
        localStorage.setItem('language', language);
        this.setDirection();
    };
    Client.prototype.switchLanguage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var postData = { 'language': _this.user.settings.language };
            _this.serverPost('user/switchLanguage', postData).then(function () {
                _this.localSwitchLanguage(_this.user.settings.language);
                _this.session.settings.language = _this.user.settings.language;
                _this.logEvent('settings/language/change', { language: _this.user.settings.language });
                resolve();
            }, function (err) {
                _this.user.settings.language = _this.session.settings.language;
                reject(err);
            });
        });
    };
    Client.prototype.logout = function () {
        this.serverGateway.token = null;
        this._session = null;
        this.clearXp();
    };
    Client.prototype.setLoggedUserId = function (userId) {
        window.FlurryAgent.setUserId(userId);
    };
    Client.prototype.logEvent = function (eventName, eventParams) {
        if (eventParams) {
            window.FlurryAgent.logEvent(eventName, eventParams);
        }
        else {
            window.FlurryAgent.logEvent(eventName);
        }
    };
    Client.prototype.getRecursiveProperty = function (object, property) {
        if (object && property) {
            var keys = property.split('.');
            var currentObject = object;
            for (var i = 0; i < keys.length; i++) {
                if (!currentObject[keys[i]]) {
                    return null;
                }
                currentObject = currentObject[keys[i]];
            }
            return currentObject;
        }
    };
    Client.prototype.setRecursiveProperty = function (object, property, value) {
        if (object && property) {
            var keys = property.split('.');
            var currentObject = object;
            for (var i = 0; i < keys.length; i++) {
                if (!currentObject[keys[i]]) {
                    return;
                }
                if (i === keys.length - 1) {
                    //Last cycle - will exit loop
                    currentObject[keys[i]] = value;
                }
            }
        }
    };
    Client.prototype.initPushService = function () {
        var _this = this;
        if (this.clientInfo.platform === 'android') {
            //Push Service - init
            //Will have sound/vibration only if sounds are on
            this.settings.google.gcm.sound = this.session.settings.notifications.sound;
            this.settings.google.gcm.vibrate = this.session.settings.notifications.vibrate;
            this.pushService = ionic_native_1.Push.init({
                'android': this.settings.google.gcm
            });
            this.pushService.on('error', function (error) {
                window.myLogError('PushNotificationError', 'Error during push: ' + error.message);
            });
            //Push Service - registration
            this.pushService.on('registration', function (registrationData) {
                if (!registrationData || !registrationData.registrationId) {
                    return;
                }
                localStorage.setItem('gcmRegistrationId', registrationData.registrationId);
                _this.user.gcmRegistrationId = registrationData.registrationId;
                if (_this.session && _this.user.gcmRegistrationId &&
                    ((_this.session.gcmRegistrationId ||
                        _this.['session'].gcmRegistrationId !== _this.user.gcmRegistrationId))) {
                    //If client has a registration Id and server has not / server has a different one
                    //Update the server
                    _this.serverPost('user/setGcmRegistration', { 'registrationId': _this.user.gcmRegistrationId }).then(function () {
                    }, function () {
                    });
                }
            });
            //Push Service - notification
            this.pushService.on('notification', function (notificationData) {
                if (_this.session && notificationData.additionalData && notificationData.additionalData.foreground) {
                    //App is in the foreground - popup the alert
                    var buttons = null;
                    if (notificationData.additionalData['contestId']) {
                        buttons = new Array();
                        buttons.push({
                            'text': notificationData.additionalData['buttonText'],
                            'cssClass': notificationData.additionalData['buttonCssClass'],
                            'handler': function () {
                                contestsService.getContest(notificationData.additionalData['contestId']).then(function (contest) {
                                    _this.showContest(contest, 'push', true);
                                }, function () {
                                });
                            }
                        });
                        if (!notificationData.additionalData['hideNotNow']) {
                            buttons.push({
                                'text': _this.translate('NOT_NOW'),
                                'role': 'cancel'
                            });
                        }
                    }
                    alertService.alertTranslated(notificationData.title, notificationData.message, buttons).then(function () {
                    }, function () {
                        //Notify push plugin that the 'notification' event has been handled
                        _this.pushService.finish(function () {
                        }, function () {
                        });
                    });
                }
                else if (notificationData.additionalData['contestId']) {
                    //App is not running or in the background
                    //Save deep linked contest id for later
                    _this.deepLinkContestId = notificationData.additionalData['contestId'];
                    //Notify push plugin that the 'notification' event has been handled
                    _this.pushService.finish(function () {
                    }, function () {
                    });
                }
            });
        }
    };
    Client = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], Client);
    return Client;
})();
exports.Client = Client;
var ServerGateway = (function () {
    function ServerGateway(http) {
        this.http = http;
        if (!window.cordova) {
            this._endPoint = window.location.protocol + '//' + window.location.host + '/';
        }
        else {
            this._endPoint = 'http://www.topteamer.com/';
        }
        this._eventQueue = [];
    }
    ServerGateway.prototype.get = function (path, timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var headers = new http_1.Headers();
            if (!timeout) {
                timeout = 10000;
            }
            if (_this._token) {
                headers.append('Authorization', _this._token);
            }
            _this.http.get(path, { headers: headers })
                .timeout(timeout)
                .map(function (res) { return res.json(); })
                .subscribe(function (res) { return resolve(res); }, function (err) {
                reject(err);
            });
        });
    };
    ;
    ServerGateway.prototype.post = function (path, postData, timeout, blockUserInterface) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var headers = new http_1.Headers();
            headers.append('Content-Type', 'application/json');
            if (_this._token) {
                headers.append('Authorization', _this._token);
            }
            if (!timeout) {
                timeout = 10000;
            }
            _this.http.post(_this._endPoint + path, JSON.stringify(postData), { headers: headers })
                .timeout(timeout)
                .map(function (res) { return res.json(); })
                .subscribe(function (res) {
                if (res['serverPopup']) {
                    _this.eventQueue.push(new InternalEvent('topTeamer:serverPopup', res['serverPopup']));
                }
                resolve(res);
            }, function (err) {
                if (err['_body'] && typeof err['_body'] === 'string') {
                    try {
                        var parsedError = JSON.parse(err['_body']);
                        reject(parsedError);
                    }
                    catch (e) {
                        reject(err);
                    }
                }
                else {
                    reject(err);
                }
            });
        });
    };
    ;
    Object.defineProperty(ServerGateway.prototype, "endPoint", {
        get: function () {
            return this._endPoint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerGateway.prototype, "eventQueue", {
        get: function () {
            return this._eventQueue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerGateway.prototype, "token", {
        set: function (value) {
            this._token = value;
        },
        enumerable: true,
        configurable: true
    });
    return ServerGateway;
})();
exports.ServerGateway = ServerGateway;
var InternalEvent = (function () {
    function InternalEvent(eventName, eventData) {
        this._eventName = eventName;
        this._eventData = eventData;
    }
    Object.defineProperty(InternalEvent.prototype, "eventName", {
        get: function () {
            return this._eventName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InternalEvent.prototype, "eventData", {
        get: function () {
            return this._eventData;
        },
        enumerable: true,
        configurable: true
    });
    return InternalEvent;
})();
exports.InternalEvent = InternalEvent;
//# sourceMappingURL=client.js.map