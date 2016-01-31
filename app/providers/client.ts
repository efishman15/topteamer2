import {Injectable} from 'angular2/core';
import {Http, Response, Headers} from 'angular2/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import {IonicApp,Platform, NavController, Menu, Alert, Events} from 'ionic/ionic';

@Injectable()
export class Client {

  static instance:Client;

  _languageKeys:Array<String>;
  _canvasContext:any;

  _ionicApp:IonicApp;
  _platform:Platform;
  _events: Events;
  _nav:NavController;
  _menu: Menu;
  _loaded:Boolean = false;

  serverGateway:ServerGateway;

  constructor(http:Http) {

    if (Client.instance) {
      throw new Error('You can\'t call new in Singleton instances! Call Client.getInstance() instead.');
    }

    this.serverGateway = new ServerGateway(http);

  }

  static getInstance() {
    if (Client.instance == null) {
      Client.instance = this;
    }

    return Client.instance;
  }

  init(ionicApp:IonicApp, platform:Platform, events: Events) {

    return new Promise((resolve, reject) => {

      this._ionicApp = ionicApp;
      this._platform = platform;
      this._events = events;

      this.serverGateway.getSettings().then((data) => {

        var dir = document.createAttribute("dir");
        dir.value = this.currentLanguage.direction;
        this._nav = ionicApp.getComponent('nav');
        this._nav.getElementRef().nativeElement.attributes.setNamedItem(dir);

        this._menu = ionicApp.getComponent('leftMenu');
        this._menu.side = this.currentLanguage.align;
        this._menu.id = this.currentLanguage.align + "Menu";

        var canvas = document.createElement("canvas");
        this._canvasContext = canvas.getContext("2d");
        this._canvasContext.font = this.serverGateway.settings.charts.contestAnnotations.annotationsFont;

        this._loaded = true;
        Client.instance = this;

        resolve();

      }, (err) => reject(err));
    })
  }

  facebookServerConnect(facebookAuthResponse) {
    return this.serverGateway.facebookConnect(facebookAuthResponse);
  }

  serverGet(path, timeout) {
    return this.serverGateway.get(path, timeout);
  }

  serverPost(path, postData?, timeout?, blockUserInterface?) {
    return this.serverGateway.post(path, postData, timeout, blockUserInterface);
  }

  setPageTitle(key : string, params? : Object) {
    this.ionicApp.setTitle(this.translate(key, params));
  }

  get loaded() : Boolean {
    return this._loaded;
  }

  get ionicApp() : IonicApp {
    return this._ionicApp;
  }

  get platform() : Platform {
    return this._platform;
  }

  get events() : Events {
    return this._events;
  }

  get nav():NavController{
    return this._nav;
  }

  get menu():Menu{
    return this._menu;
  }

  get endPoint():String {
    return this.serverGateway.endPoint;
  }

  get settings():Object {
    return this.serverGateway.settings;
  }

  get user():Object {
    return this.serverGateway.user;
  }

  get session():Object {
    return this.serverGateway.session;
  }

  get currentLanguage():Object {
    return this.serverGateway.settings.languages[this.serverGateway.user.settings.language];
  }

  get languageKeys():Array < String > {
    if (!this._languageKeys) {
      this._languageKeys = Object.keys(this.serverGateway.settings.languages);
    }
    return this._languageKeys;
  }

  get canvasContext():any {
    return this._canvasContext;
  }

  translate(key:String, params? : Object) {
    var translatedValue = this.serverGateway.settings.ui[this.serverGateway.user.settings.language][key];
    if (params) {
      translatedValue = translatedValue.format(params);
    }

    return translatedValue;
  }
}

export class ServerGateway {

  http:Http;
  _session:Object;
  _settings: Object;
  _endPoint:string;
  _user: Object;

  constructor(http:Http) {
    this.http = http;
  }

  get(path, timeout) {

    return new Promise((resolve, reject) => {
      var headers = new Headers();

      if (!timeout) {
        timeout = 10000;
      }

      if (this.session) {
        headers.append('Authorization', this.session.token);
      }

      this.http.get(path, {headers: headers})
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

  post(path : string, postData : Object, timeout? : number, blockUserInterface? : boolean) {

    return new Promise((resolve, reject) => {

      var headers = new Headers();
      headers.append('Content-Type', 'application/json');

      if (this._session) {
        headers.append('Authorization', this._session.token);
      }

      if (!timeout) {
        timeout = 10000;
      }

      this.http.post(this._endPoint + path, JSON.stringify(postData), {headers: headers})
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

  getSettings() {

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
        if (this.platform.is('android')) {
          clientInfo.platform = 'android';
        }
        else if (this.platform.is('ios')) {
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

        resolve();

      }, (err) => reject(err));
    });
  }

  initUser(language, clientInfo, geoInfo) {

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

  get endPoint():String {
    return this._endPoint;
  }

  get settings():Object {
    return this._settings;
  }

  get user():Object {
    return this._user;
  }

  get session():Object {
    return this._session;
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

}
