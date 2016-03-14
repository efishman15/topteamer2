"use strict";
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
var http_1 = require('angular2/http');
require('rxjs/add/operator/map');
require('rxjs/add/operator/timeout');
var facebookService = require('./facebook');
var alertService = require('./alert');
var contestsService = require('./contests');
var objects_1 = require('../objects/objects');
var Client = (function () {
    function Client(http) {
        this.circle = Math.PI * 2;
        this.quarter = Math.PI / 2;
        this._showSpinner = true;
        this._loaded = false;
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
            if (this.platform.is('android')) {
                this.clientInfo.platform = 'android';
            }
            else if (this.platform.is('ios')) {
                this.clientInfo.platform = 'ios';
            }
        }
        this.serverGateway = new ServerGateway(http);
    }
    Client.getInstance = function () {
        if (Client.instance == null) {
            Client.instance = this;
        }
        return Client.instance;
    };
    Client.prototype.init = function (ionicApp, platform, config, menuController, events) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._ionicApp = ionicApp;
            _this._platform = platform;
            _this._config = config;
            _this.menuController = menuController;
            _this._events = events;
            var language = localStorage.getItem('language');
            _this.getSettings(language).then(function (data) {
                _this._settings = data['settings'];
                if (!language || language === 'undefined') {
                    //Language was computed on the server using geoInfo or the fallback to the default language
                    language = data['language'];
                    localStorage.setItem('language', language);
                }
                _this.initUser(language, data['geoInfo']);
                _this.initXpCanvas();
                _this.setDirection();
                _this._loaded = true;
                Client.instance = _this;
                resolve();
            }, function (err) { return reject(err); });
        });
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
    Client.prototype.initXpCanvas = function () {
        //Player info rank canvas
        this.canvas = document.getElementById('playerInfoRankCanvas');
        this._canvasContext = this.canvas.getContext('2d');
        this.canvasCenterX = this.settings.xpControl.canvas.width / 2;
        this.canvasCenterY = this.settings.xpControl.canvas.height / 2;
        this.canvas.width = this.settings.xpControl.canvas.width;
        this.canvas.style.width = this.settings.xpControl.canvas.width + 'px';
        this.canvas.height = this.settings.xpControl.canvas.height;
        this.canvas.style.height = this.settings.xpControl.canvas.height + 'px';
    };
    Client.prototype.initXp = function () {
        this._canvasContext.clearRect(0, 0, this.settings.xpControl.canvas.width, this.settings.xpControl.canvas.height);
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
        this._nav = this.ionicApp.getComponent('nav');
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
                _this.user.settings = data['session'].settings;
                _this._session = data['session'];
                _this.serverGateway.token = data['session'].token;
                _this.setLoggedUserId(data['session'].userId);
                if (data['session'].justRegistered) {
                    _this.logEvent('server/register');
                }
                else {
                    _this.logEvent('server/login');
                }
                if (_this.clientInfo.platform === 'android') {
                    var push = window.PushNotification.init({
                        'android': _this.settings.google.gcm,
                        'ios': { 'alert': 'true', 'badge': 'true', 'sound': 'true' },
                        'windows': {}
                    });
                    push.on('registration', function (registrationData) {
                        if (!registrationData || !registrationData.registrationId) {
                            return;
                        }
                        localStorage.setItem('gcmRegistrationId', registrationData.registrationId);
                        //Update the server with the registration id - if server has no registration or it has a different reg id
                        //Just submit and forget
                        if (!data['session'].gcmRegistrationId || data['session'].gcmRegistrationId !== registrationData.registrationId) {
                            this.post('user/setGcmRegistration', { 'registrationId': registrationData.registrationId });
                        }
                    });
                    push.on('notification', function (notificationData) {
                        if (notificationData.additionalData && notificationData.additionalData.contestId) {
                            //TODO: QA - Check Push notification about a contest
                            contestsService.openContest(notificationData.additionalData.contestId);
                        }
                    });
                    push.on('error', function (error) {
                        this.logError('PushNotificationError', 'Error during push: ' + error.message);
                    });
                    var storedGcmRegistration = localStorage.getItem('gcmRegistrationId');
                    if (storedGcmRegistration && !_this.session.gcmRegistrationId) {
                        _this.serverPost('user/setGcmRegistration', { 'registrationId': storedGcmRegistration });
                    }
                }
                resolve();
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
            _this.showSpinner = true;
            _this.serverGateway.post(path, postData, timeout, blockUserInterface).then(function (data) {
                _this.showSpinner = false;
                if (_this.nav && _this.nav.length() > 0) {
                    //GUI is initiated - process the events right away
                    _this.processInternalEvents();
                }
                resolve(data);
            }, function (err) {
                _this.showSpinner = false;
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
                else {
                    //Display an alert or confirm message and continue the reject so further 'catch' blocks
                    //will be invoked if any
                    if (!err.additionalInfo || !err.additionalInfo.confirm) {
                        alertService.alert(err).then(function () {
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
        this.ionicApp.setTitle(this.translate(key, params));
    };
    Object.defineProperty(Client.prototype, "showSpinner", {
        get: function () {
            return this._showSpinner;
        },
        set: function (value) {
            var _this = this;
            //Must be async - issue related to 'field changed since last checked' - in angular2
            setTimeout(function () {
                _this._showSpinner = value;
            }, 100);
        },
        enumerable: true,
        configurable: true
    });
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
    Object.defineProperty(Client.prototype, "ionicApp", {
        get: function () {
            return this._ionicApp;
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
    Object.defineProperty(Client.prototype, "isMenuOpen", {
        get: function () {
            return this.menuController.isOpen();
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
            return this.settings.languages[this.user.settings.language];
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
    Client.prototype.translate = function (key, params) {
        var translatedValue = this.settings.ui[this.user.settings.language][key];
        if (params) {
            translatedValue = translatedValue.format(params);
        }
        return translatedValue;
    };
    Client.prototype.toggleSound = function () {
        return this.serverPost('user/toggleSound');
    };
    Client.prototype.localSwitchLanguage = function (language) {
        localStorage.setItem('language', language);
        this.setDirection();
    };
    Client.prototype.switchLanguage = function (language) {
        this.localSwitchLanguage(language);
        var postData = { 'language': language };
        return this.serverPost('user/switchLanguage', postData);
    };
    Client.prototype.logout = function () {
        this.serverGateway.token = null;
        this._session = null;
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
    Client.prototype.logError = function (errorType, message) {
        window.FlurryAgent.logError(errorType.substring(0, 255), message.substring(0, 255), 0);
    };
    Client = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], Client);
    return Client;
}());
exports.Client = Client;
var ServerGateway = (function () {
    function ServerGateway(http) {
        this.http = http;
        if (!window.cordova) {
            //this._endPoint = 'http://www.topteamer.com/'
            this._endPoint = window.location.protocol + '//' + window.location.host + '/';
        }
        else {
            //TODO: change back to prod site
            this._endPoint = 'http://dev.topteamer.com/';
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
                reject(JSON.parse(err['_body']));
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
}());
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
}());
exports.InternalEvent = InternalEvent;
