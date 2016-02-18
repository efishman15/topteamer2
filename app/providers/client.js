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
var Client = (function () {
    function Client(http) {
        this.circle = Math.PI * 2;
        this.quarter = Math.PI / 2;
        this._loaded = false;
        if (Client.instance) {
            throw new Error('You can\'t call new in Singleton instances! Call Client.getInstance() instead.');
        }
        this.serverGateway = new ServerGateway(http);
    }
    Client.getInstance = function () {
        if (Client.instance == null) {
            Client.instance = this;
        }
        return Client.instance;
    };
    Client.prototype.init = function (ionicApp, platform, menuController, events) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._ionicApp = ionicApp;
            _this._platform = platform;
            _this._menuController = menuController;
            _this._events = events;
            _this.serverGateway.getSettings().then(function (data) {
                _this.initXpCanvas();
                _this.setDirection();
                _this._loaded = true;
                Client.instance = _this;
                resolve();
            }, function (err) { return reject(err); });
        });
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
                myRequestAnimationFrame(function () {
                    var endPoint = (_this.session.xpProgress.current + i) / _this.session.xpProgress.max;
                    _this.animateXpAddition(startPoint, endPoint, _this.quarter, _this.circle);
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
        this._nav = this._ionicApp.getComponent('nav');
        this._nav.getElementRef().nativeElement.attributes.setNamedItem(dir);
        var playerInfo = document.getElementById('playerInfo');
        if (playerInfo) {
            playerInfo.className = 'player-info-' + this.currentLanguage.direction;
        }
        this.canvas.className = 'player-info-canvas-' + this.currentLanguage.direction;
    };
    Client.prototype.facebookServerConnect = function (facebookAuthResponse) {
        return this.serverGateway.facebookConnect(facebookAuthResponse);
    };
    Client.prototype.serverGet = function (path, timeout) {
        return this.serverGateway.get(path, timeout);
    };
    Client.prototype.serverPost = function (path, postData, timeout, blockUserInterface) {
        return this.serverGateway.post(path, postData, timeout, blockUserInterface);
    };
    Client.prototype.setPageTitle = function (key, params) {
        this.ionicApp.setTitle(this.translate(key, params));
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
    Object.defineProperty(Client.prototype, "isMenuOpen", {
        get: function () {
            return (this._menuController._menus.length > 0 && this._menuController._menus[0].isOpen);
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
            return this.serverGateway.settings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "user", {
        get: function () {
            return this.serverGateway.user;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "session", {
        get: function () {
            return this.serverGateway.session;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "currentLanguage", {
        get: function () {
            return this.serverGateway.settings.languages[this.serverGateway.user.settings.language];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "languageKeys", {
        get: function () {
            if (!this._languageKeys) {
                this._languageKeys = Object.keys(this.serverGateway.settings.languages);
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
        var translatedValue = this.serverGateway.settings.ui[this.serverGateway.user.settings.language][key];
        if (params) {
            translatedValue = translatedValue.format(params);
        }
        return translatedValue;
    };
    Client.prototype.toggleSound = function () {
        return this.serverPost('user/toggleSound');
    };
    Client.prototype.switchLanguage = function (language) {
        localStorage.setItem('language', language);
        this.setDirection();
        var postData = { 'language': language };
        return this.serverPost('user/switchLanguage', postData);
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
    }
    ServerGateway.prototype.get = function (path, timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var headers = new http_1.Headers();
            if (!timeout) {
                timeout = 10000;
            }
            if (_this.session) {
                headers.append('Authorization', _this.session.token);
            }
            _this.http.get(path, { headers: headers })
                .timeout(timeout)
                .map(function (res) { return res.json(); })
                .subscribe(function (res) { return resolve(res); }, function (err) {
                if (reject) {
                    reject(err);
                }
                else {
                    FlurryAgent.myLogError('ServerPost', err);
                }
            });
        });
    };
    ;
    ServerGateway.prototype.post = function (path, postData, timeout, blockUserInterface) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var headers = new http_1.Headers();
            headers.append('Content-Type', 'application/json');
            if (_this._session) {
                headers.append('Authorization', _this._session.token);
            }
            if (!timeout) {
                timeout = 10000;
            }
            _this.http.post(_this._endPoint + path, JSON.stringify(postData), { headers: headers })
                .timeout(timeout)
                .map(function (res) { return res.json(); })
                .subscribe(function (res) { return resolve(res); }, function (err) {
                if (reject) {
                    reject(err);
                }
                else {
                    FlurryAgent.myLogError('ServerPost', err);
                }
            });
        });
    };
    ;
    ServerGateway.prototype.getSettings = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var clientInfo = {};
            if (!window.cordova) {
                //this._endPoint = 'http://www.topteamer.com/'
                _this._endPoint = window.location.protocol + '//' + window.location.host + '/';
                clientInfo.mobile = false;
                if (window.self !== window.top) {
                    clientInfo.platform = 'facebook';
                }
                else {
                    clientInfo.platform = 'web';
                }
            }
            else {
                _this._endPoint = 'http://www.topteamer.com/';
                clientInfo.mobile = true;
                if (_this.platform.is('android')) {
                    clientInfo.platform = 'android';
                }
                else if (_this.platform.is('ios')) {
                    clientInfo.platform = 'ios';
                }
            }
            var postData = {};
            postData.clientInfo = clientInfo;
            var language = localStorage.getItem('language');
            if (language) {
                //This will indicate to the server NOT to retrieve geo info - since language is already determined
                postData.language = language;
            }
            else {
                //TODO - get geo info
                postData.defaultLanguage = _this.getDefaultLanguage();
            }
            _this.post('info/settings', postData).then(function (data) {
                _this._settings = data.settings;
                if (!language) {
                    //Language was computed on the server using geoInfo or the fallback to the default language
                    language = data.language;
                    localStorage.setItem('language', language);
                }
                _this.initUser(language, clientInfo, data.geoInfo);
                resolve();
            }, function (err) { return reject(err); });
        });
    };
    ServerGateway.prototype.initUser = function (language, clientInfo, geoInfo) {
        this._user = {
            'settings': {
                'language': language,
                'timezoneOffset': (new Date).getTimezoneOffset()
            },
            'clientInfo': clientInfo
        };
        if (geoInfo) {
            this.user.geoInfo = geoInfo;
        }
    };
    ServerGateway.prototype.facebookConnect = function (facebookAuthResponse) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this._user.thirdParty) {
                _this._user.thirdParty = {};
            }
            _this._user.thirdParty.type = 'facebook';
            _this._user.thirdParty.id = facebookAuthResponse.userID;
            _this._user.thirdParty.accessToken = facebookAuthResponse.accessToken;
            _this.post('user/facebookConnect', { 'user': _this._user }).then(function (session) {
                if (_this._user.settings.language !== session.settings.language) {
                    _this._user.settings.language = session.settings.language;
                    localStorage.setItem('language', _this._user.settings.language);
                }
                _this._user.settings = session.settings;
                _this._session = session;
                FlurryAgent.setUserId(session.userId);
                if (session.justRegistered) {
                    FlurryAgent.logEvent('server/register');
                }
                else {
                    FlurryAgent.logEvent('server/login');
                }
                if (_this._user.clientInfo.platform === 'android') {
                    var push = PushNotification.init({
                        'android': _this._settings.google.gcm,
                        'ios': { 'alert': 'true', 'badge': 'true', 'sound': 'true' },
                        'windows': {}
                    });
                    push.on('registration', function (data) {
                        if (!data || !data.registrationId) {
                            return;
                        }
                        localStorage.setItem('gcmRegistrationId', data.registrationId);
                        //Update the server with the registration id - if server has no registration or it has a different reg id
                        //Just submit and forget
                        if (!session.gcmRegistrationId || session.gcmRegistrationId !== data.registrationId) {
                            this.post('user/setGcmRegistration', { 'registrationId': data.registrationId });
                        }
                    });
                    push.on('notification', function (data) {
                        if (data.additionalData && data.additionalData.contestId) {
                        }
                    });
                    push.on('error', function (e) {
                        FlurryAgent.myLogError('PushNotificationError', 'Error during push: ' + e.message);
                    });
                    var storedGcmRegistration = localStorage.getItem('gcmRegistrationId');
                    if (storedGcmRegistration && !session.gcmRegistrationId) {
                        _this.post('user/setGcmRegistration', { 'registrationId': storedGcmRegistration });
                    }
                }
                resolve();
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
    Object.defineProperty(ServerGateway.prototype, "settings", {
        get: function () {
            return this._settings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerGateway.prototype, "user", {
        get: function () {
            return this._user;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServerGateway.prototype, "session", {
        get: function () {
            return this._session;
        },
        enumerable: true,
        configurable: true
    });
    ServerGateway.prototype.getDefaultLanguage = function () {
        //Always return a language - get the browser's language
        var language = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
        if (!language) {
            language = 'en';
        }
        if (language.length > 2) {
            language = language.toLowerCase().substring(0, 2);
        }
        return language;
    };
    return ServerGateway;
})();
exports.ServerGateway = ServerGateway;
