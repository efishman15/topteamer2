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
    Client.prototype.init = function (ionicApp, platform, modal, popup, events) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._ionicApp = ionicApp;
            _this._platform = platform;
            _this._modal = modal;
            _this._popup = popup;
            _this._events = events;
            _this.serverGateway.getSettings().then(function (data) {
                var dir = document.createAttribute("dir");
                dir.value = _this.currentLanguage.direction;
                _this._nav = ionicApp.getComponent('nav');
                _this._nav.getElementRef().nativeElement.attributes.setNamedItem(dir);
                _this._menu = ionicApp.getComponent('leftMenu');
                _this._menu.side = _this.currentLanguage.align;
                _this._menu.id = _this.currentLanguage.align + "Menu";
                var canvas = document.createElement("canvas");
                _this._canvasContext = canvas.getContext("2d");
                _this._canvasContext.font = _this.serverGateway.settings.charts.contestAnnotations.annotationsFont;
                _this._loaded = true;
                Client.instance = _this;
                resolve();
            }, function (err) { return reject(err); });
        });
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
    Object.defineProperty(Client.prototype, "modal", {
        get: function () {
            return this._modal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "popup", {
        get: function () {
            return this._popup;
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
    Object.defineProperty(Client.prototype, "menu", {
        get: function () {
            return this._menu;
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
