import {Injectable} from 'angular2/core';
import {Http, Response, Headers} from 'angular2/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import {IonicApp,Platform, NavController, Menu, MenuController, Alert, Events} from 'ionic/ionic';

@Injectable()
export class Client {

  static instance:Client;

  _languageKeys:Array<String>;

  canvas:any;
  _canvasContext:any;
  circle:number = Math.PI * 2;
  quarter:number = Math.PI / 2;
  canvasCenterX:number;
  canvasCenterY:number;

  _ionicApp:IonicApp;
  _platform:Platform;
  _events:Events;
  _nav:NavController;
  _menuController:MenuController;
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

  init(ionicApp:IonicApp, platform:Platform, menuController:MenuController, events:Events) {

    return new Promise((resolve, reject) => {

      this._ionicApp = ionicApp;
      this._platform = platform;
      this._menuController = menuController;
      this._events = events;

      this.serverGateway.getSettings().then((data) => {

        this.initXpCanvas();

        this.setDirection();

        this._loaded = true;
        Client.instance = this;

        resolve();

      }, (err) => reject(err));
    })
  }

  initXpCanvas() {
    //Player info rank canvas
    this.canvas = document.getElementById('playerInfoRankCanvas');
    this._canvasContext = this.canvas.getContext('2d');
    this.canvasCenterX = this.settings.xpControl.canvas.width / 2;
    this.canvasCenterY = this.settings.xpControl.canvas.height / 2;
    this.canvas.width = this.settings.xpControl.canvas.width;
    this.canvas.style.width = this.settings.xpControl.canvas.width + 'px';
    this.canvas.height = this.settings.xpControl.canvas.height;
    this.canvas.style.height = this.settings.xpControl.canvas.height + 'px';
  }

  initXp() {
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
  }

  animateXpAddition(startPoint, endPoint) {

    this._canvasContext.beginPath();
    this._canvasContext.arc(this.canvasCenterX, this.canvasCenterY, this.settings.xpControl.radius, (this.circle * startPoint) - this.quarter, (this.circle * endPoint) - this.quarter, false);
    this._canvasContext.strokeStyle = this.settings.xpControl.progressLineColor;
    this._canvasContext.stroke();
    this._canvasContext.closePath();
  }

  addXp(xpProgress) {

    return new Promise((resolve, reject) => {

      var startPoint = this.session.xpProgress.current / this.session.xpProgress.max;

      //Occurs after xp has already been added to the session
      var addition = xpProgress.addition;
      for (var i = 1; i <= addition; i++) {
        myRequestAnimationFrame(() => {
          var endPoint = (this.session.xpProgress.current + i) / this.session.xpProgress.max;
          this.animateXpAddition(startPoint, endPoint, this.quarter, this.circle);

          //Last iteration should be performed after the animation frame event happened
          if (i >= addition) {

            //Add the actual xp to the client side
            this.session.xpProgress = xpProgress;

            //Zero the addition
            this.session.xpProgress.addition = 0;

            if (xpProgress.rankChanged) {
              this.session.rank = xpProgress.rank;
              this.initXp();
            }
          }
        })
      }
      resolve();
    });

  }

  setDirection() {
    var dir = document.createAttribute('dir');
    dir.value = this.currentLanguage.direction;
    this._nav = this._ionicApp.getComponent('nav');
    this._nav.getElementRef().nativeElement.attributes.setNamedItem(dir);

    var playerInfo = document.getElementById('playerInfo');
    if (playerInfo) {
      playerInfo.className = 'player-info-' + this.currentLanguage.direction;
    }

    this.canvas.className = 'player-info-canvas-' + this.currentLanguage.direction;
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

  setPageTitle(key:string, params?:Object) {
    this.ionicApp.setTitle(this.translate(key, params));
  }

  get loaded():Boolean {
    return this._loaded;
  }

  get ionicApp():IonicApp {
    return this._ionicApp;
  }

  get platform():Platform {
    return this._platform;
  }

  get events():Events {
    return this._events;
  }

  get nav():NavController {
    return this._nav;
  }

  get isMenuOpen():Boolean  {
    return (this._menuController._menus.length > 0 && this._menuController._menus[0].isOpen);
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

  translate(key:String, params?:Object) {
    var translatedValue = this.serverGateway.settings.ui[this.serverGateway.user.settings.language][key];
    if (params) {
      translatedValue = translatedValue.format(params);
    }

    return translatedValue;
  }

  toggleSound() {
    return this.serverPost('user/toggleSound');
  }

  switchLanguage(language:string) {
    localStorage.setItem('language', language);
    this.setDirection();
    var postData = {'language': language};
    return this.serverPost('user/switchLanguage', postData);
  }
}

export class ServerGateway {

  http:Http;
  _session:Object;
  _settings:Object;
  _endPoint:string;
  _user:Object;

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

  post(path:string, postData:Object, timeout?:number, blockUserInterface?:boolean) {

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
          (err:Object) => {
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
        //TODO - get geo info
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
