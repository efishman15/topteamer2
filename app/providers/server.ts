import {Injectable} from 'angular2/core';
import {Http, Response, Headers} from 'angular2/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import {Platform} from 'ionic-framework/ionic';

@Injectable()
export class Server {

  static instance:Server;

  private _http:Http;
  private _endPoint:String;
  private _session:Object;
  private _settings:Object;
  private _user:Object;
  private _languageKeys:Array<String>;
  private _canvasContext:any;

  constructor(http:Http) {

    if (Server.instance) {
      throw new Error('You can\'t call new in Singleton instances! Call Server.getInstance() instead.');
    }

    this._http = http;

  }

  static getInstance() {
    if (Server.instance == null) {
      Server.instance = this;
    }

    return Server.instance;
  }

  init(platform:Platform) {

    return new Promise((resolve, reject) => {

      var clientInfo = {};

      if (!window.cordova) {
        //this._endPoint = 'http://www.topteamer.com/'
        this._endPoint = window.location.protocol + '//' + window.location.host + '/';
        clientInfo.mobile = false;
        if (window.self !== window.top) {
          clientInfo.platform = 'facebook';
        }
        else {
          clientInfo.platform = 'web';
        }
      }
      else {
        this._endPoint = 'http://www.topteamer.com/'
        clientInfo.mobile = true;
        if (platform.is('android')) {
          clientInfo.platform = 'android';
        }
        else if (platform.is('ios')) {
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
        postData.defaultLanguage = this.getDefaultLanguage();
      }

      this.post('info/settings', postData).then((data) => {
        this._settings = data.settings;
        if (!language) {
          //Language was computed on the server using geoInfo or the fallback to the default language
          language = data.language;
          localStorage.setItem('language', language);
        }

        this.initUser(language, clientInfo, data.geoInfo);

        Server.instance = this;

        var canvas = document.createElement("canvas");
        this._canvasContext = canvas.getContext("2d");
        this._canvasContext.font = this._settings.charts.contestAnnotations.annotationsFont;

        resolve();

      }, (err) => reject(err));
    })
  }

  facebookConnect(facebookAuthResponse) {

    return new Promise((resolve, reject) => {

      if (!this._user.thirdParty) {
        this._user.thirdParty = {};
      }
      this._user.thirdParty.type = 'facebook';
      this._user.thirdParty.id = facebookAuthResponse.userID;
      this._user.thirdParty.accessToken = facebookAuthResponse.accessToken;

      this.post('user/facebookConnect', {'user': this._user}).then((session) => {
        if (this._user.settings.language !== session.settings.language) {
          this._user.settings.language = session.settings.language;
          localStorage.setItem('language', this._user.settings.language);
        }

        this._user.settings = session.settings;

        this._session = session;

        FlurryAgent.setUserId(session.userId);

        if (session.justRegistered) {
          FlurryAgent.logEvent('server/register');
        }
        else {
          FlurryAgent.logEvent('server/login');
        }

        if (this._user.clientInfo.platform === 'android') {

          var push = PushNotification.init(
            {
              'android': this._settings.google.gcm,
              'ios': {'alert': 'true', 'badge': 'true', 'sound': 'true'},
              'windows': {}
            }
          );

          push.on('registration', function (data) {

            if (!data || !data.registrationId) {
              return;
            }

            localStorage.setItem('gcmRegistrationId', data.registrationId);

            //Update the server with the registration id - if server has no registration or it has a different reg id
            //Just submit and forget
            if (!session.gcmRegistrationId || session.gcmRegistrationId !== data.registrationId) {
              this.post('user/setGcmRegistration', {'registrationId': data.registrationId});
            }
          });

          push.on('notification', function (data) {
            if (data.additionalData && data.additionalData.contestId) {
              //$rootScope.gotoView('app.contest', false, {id: data.additionalData.contestId}); TODO: Deep link to contest
            }
          });

          push.on('error', function (e) {
            FlurryAgent.myLogError('PushNotificationError', 'Error during push: ' + e.message);
          });

          var storedGcmRegistration = localStorage.getItem('gcmRegistrationId');
          if (storedGcmRegistration && !session.gcmRegistrationId) {
            this.post('user/setGcmRegistration', {'registrationId': storedGcmRegistration});
          }

        }

        resolve();

      });

    })
  };

  get settings():Object {
    return this._settings;
  }

  get user():Object {
    return this._user;
  }

  get session():Object {
    return this._session;
  }

  get currentLanguage():Object {
    return this._settings.languages[this._user.settings.language];
  }

  get languageKeys():Array < String > {
    if (
      !this._languageKeys
    ) {
      this._languageKeys = Object.keys(this._settings.languages);
    }
    return this._languageKeys;
  }

  get canvasContext() : any {
    return this._canvasContext;
  }

  translate(key:String, params: Object) {
    var translatedValue = this._settings.ui[this._user.settings.language][key];
    if (params) {
      translatedValue = translatedValue.format(params);
    }

    return translatedValue;
  }

  private getDefaultLanguage() {
    //Always return a language - get the browser's language
    var language = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage)
    if (!language) {
      language = 'en';
    }
    if (language.length > 2) {
      language = language.toLowerCase().substring(0, 2);
    }

    return language;
  }

  private initUser(language, clientInfo, geoInfo) {

    this._user = {
      'settings': {
        'language': language,
        'timezoneOffset': (new Date).getTimezoneOffset()
      },
      'clientInfo': clientInfo
    };

    if (geoInfo) {
      this._user.geoInfo = geoInfo;
    }

  }

  get(path, timeout) {

    return new Promise((resolve, reject) => {
      var headers = new Headers();

      if (!timeout) {
        timeout = 10000;
      }

      if (this._session) {
        headers.append('Authorization', this._session.token);
      }

      this._http.get(path, {headers: headers})
        .timeout(timeout)
        .map((res:Response) => res.json())
        .subscribe((res:Object) => resolve(res),
          err => {
            if (reject) {
              reject(err);
            }
            else {
              FlurryAgent.myLogError('ServerPost', err);
            }
          });
    });
  };

  post(path, postData, timeout, blockUserInterface) {

    return new Promise((resolve, reject) => {

      var headers = new Headers();
      headers.append('Content-Type', 'application/json');

      if (this._session) {
        headers.append('Authorization', this._session.token);
      }

      if (!timeout) {
        timeout = 10000;
      }

      this._http.post(this._endPoint + path, JSON.stringify(postData), {headers: headers})
        .timeout(timeout)
        .map((res:Response) => res.json())
        .subscribe(
          (res:Object) => resolve(res),
          err => {
            if (reject) {
              reject(err);
            }
            else {
              FlurryAgent.myLogError('ServerPost', err);
            }
          }
        );
    });
  };
}
