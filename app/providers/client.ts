import {Injectable} from 'angular2/core';
import {Http, Response, Headers} from 'angular2/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import {IonicApp,Platform,Config, NavController, Menu, MenuController, Alert, Modal, Events} from 'ionic-angular';
import * as facebookService from './facebook';
import * as alertService from './alert';
import * as contestsService from './contests';
import {User,Session,ClientInfo,Settings,Language,ThirdPartyInfo} from '../objects/objects';
import {LoadingModalComponent} from '../components/loading-modal/loading-modal'
import {ContestTypePage} from '../pages/contest-type/contest-type';
import {SetContestPage} from '../pages/set-contest/set-contest';

@Injectable()
export class Client {

  static instance:any;

  _languageKeys:Array<string>;

  canvas:any;
  _canvasContext:any;
  circle:number = Math.PI * 2;
  quarter:number = Math.PI / 2;
  canvasCenterX:number;
  canvasCenterY:number;

  _ionicApp:IonicApp;
  _platform:Platform;
  _config:Config;
  _events:Events;
  _nav:NavController;
  loadingModalComponent: LoadingModalComponent;
  menuController:MenuController;
  _user:User;
  _session:Session;
  _settings:Settings;
  _loaded:Boolean = false;
  clientInfo:ClientInfo;

  serverGateway:ServerGateway;

  constructor(http:Http) {

    if (Client.instance) {
      throw new Error('You can\'t call new in Singleton instances! Call Client.getInstance() instead.');
    }

    this.clientInfo = new ClientInfo();

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

  static getInstance() {
    if (Client.instance == null) {
      Client.instance = this;
    }

    return Client.instance;
  }

  init(ionicApp:IonicApp, platform:Platform, config:Config, menuController:MenuController, events:Events) {

    return new Promise((resolve, reject) => {

      this._ionicApp = ionicApp;
      this._platform = platform;
      this._config = config;
      this.menuController = menuController;
      this._events = events;

      var language = localStorage.getItem('language');

      this.getSettings(language).then((data) => {

        this._settings = data['settings'];
        if (!language || language === 'undefined') {
          //Language was computed on the server using geoInfo or the fallback to the default language
          language = data['language'];
          localStorage.setItem('language', language);
        }

        this.initUser(language, data['geoInfo']);

        this.initXpCanvas();

        this.setDirection();

        this._loaded = true;
        Client.instance = this;

        resolve();
      }, (err) => reject(err));
    });
  }

  getSettings(localStorageLanguage) {

    var postData = {'clientInfo': this.clientInfo};

    if (localStorageLanguage && localStorageLanguage !== 'undefined') {
      //This will indicate to the server NOT to retrieve geo info - since language is already determined
      postData['language'] = localStorageLanguage;
    }
    else {
      //Server will try to retrieve geo info based on client ip - if fails - will revert to this default language
      postData['defaultLanguage'] = this.getDefaultLanguage();
    }

    return this.serverPost('info/settings', postData);
  }

  initUser(language, geoInfo) {

   this._user = new User(language, this.clientInfo, geoInfo);
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
        window.myRequestAnimationFrame(() => {
          var endPoint = (this.session.xpProgress.current + i) / this.session.xpProgress.max;
          this.animateXpAddition(startPoint, endPoint);

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
    this._nav = this.ionicApp.getComponent('nav');
    this.nav.getElementRef().nativeElement.attributes.setNamedItem(dir);

    var playerInfo = document.getElementById('playerInfo');
    if (playerInfo) {
      playerInfo.className = 'player-info-' + this.currentLanguage.direction;
    }

    this.canvas.className = 'player-info-canvas-' + this.currentLanguage.direction;
    this.config.set('backButtonIcon', this.currentLanguage.backButtonIcon);

  }

  facebookServerConnect(facebookAuthResponse) {

    return new Promise((resolve, reject) => {

      if (!this.user.thirdParty) {
        this.user.thirdParty = new ThirdPartyInfo();
      }
      this.user.thirdParty.type = 'facebook';
      this.user.thirdParty.id = facebookAuthResponse.userID;
      this.user.thirdParty.accessToken = facebookAuthResponse.accessToken;

      this.serverPost('user/facebookConnect', {'user': this.user}).then((data) => {
        if (this.user.settings.language !== data['session'].settings.language) {
          this.user.settings.language = data['session'].settings.language;
          this.localSwitchLanguage(this.user.settings.language);
        }

        this.user.settings = data['session'].settings;

        this._session = data['session'];
        this.serverGateway.token = data['session'].token;

        this.setLoggedUserId(data['session'].userId);

        if (data['session'].justRegistered) {
          this.logEvent('server/register');
        }
        else {
          this.logEvent('server/login');
        }

        if (this.clientInfo.platform === 'android') {

          var push = window.PushNotification.init(
            {
              'android': this.settings.google.gcm,
              'ios': {'alert': 'true', 'badge': 'true', 'sound': 'true'},
              'windows': {}
            }
          );

          push.on('registration', function (registrationData) {

            if (!registrationData || !registrationData.registrationId) {
              return;
            }

            localStorage.setItem('gcmRegistrationId', registrationData.registrationId);

            //Update the server with the registration id - if server has no registration or it has a different reg id
            //Just submit and forget
            if (!data['session'].gcmRegistrationId || data['session'].gcmRegistrationId !== registrationData.registrationId) {
              this.post('user/setGcmRegistration', {'registrationId': registrationData.registrationId});
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
          if (storedGcmRegistration && !this.session.gcmRegistrationId) {
            this.serverPost('user/setGcmRegistration', {'registrationId': storedGcmRegistration});
          }
        }

        resolve();

      });

    })
  };

  serverGet(path, timeout) {
    return this.serverGateway.get(path, timeout);
  }

  serverPost(path, postData ?, timeout ?, blockUserInterface ?) {
    return new Promise((resolve, reject) => {
      this.showLoader();
      this.serverGateway.post(path, postData, timeout, blockUserInterface).then((data) => {
        this.hideLoader();
        if (this.nav && this.nav.length() > 0) {
          //GUI is initiated - process the events right away
          this.processInternalEvents();
        }
        resolve(data);
      }, (err) => {
        this.hideLoader();
        if (err && err.httpStatus === 401) {
          facebookService.getLoginStatus().then((result) => {
            if (result['connected']) {
              this.facebookServerConnect(result['response'].authResponse).then(() => {
                return this.serverPost(path, postData, timeout, blockUserInterface).then((data) => {
                  resolve(data);
                }, (err) => {
                  reject(err);
                })
              });
            }
            else {
              facebookService.login(false).then((response) => {
                this.facebookServerConnect(result['response'].authResponse).then(() => {
                  return this.serverPost(path, postData, timeout, blockUserInterface).then((data) => {
                    resolve(data);
                  }, (err) => {
                    reject(err);
                  })
                })
              })
            }
          });
        }
        else {
          //Display an alert or confirm message and continue the reject so further 'catch' blocks
          //will be invoked if any
          if (!err.additionalInfo || !err.additionalInfo.confirm) {
            alertService.alert(err).then(() => {
              reject(err);
            });
          }
          else {
            var title = err.type + '_TITLE';
            var message = err.type + '_MESSAGE';
            alertService.confirm(title, message, err.params).then(() => {
              err.additionalInfo.confirmed = true;
              reject(err);
            }, () => {
              reject(err);
            });
          }
        }
      });
    });
  }

  processInternalEvents() {
    while (this.serverGateway.eventQueue.length > 0) {
      var internalEvent = this.serverGateway.eventQueue.shift();
      this.events.publish(internalEvent.eventName, internalEvent.eventData);
    }
  }

  setPageTitle(key:string, params ?:Object) {
    this.ionicApp.setTitle(this.translate(key, params));
  }

  openNewContest() {
    this.logEvent('menu/newContest');
    var modal = Modal.create(ContestTypePage);
    modal.onDismiss((contestType) => {
      if (contestType) {
        setTimeout(() => {
          this.nav.push(SetContestPage, {'mode': 'add', 'type': contestType});
        }, 500);
      }
    });
    this.nav.present(modal);
  }


  initLoader() {
    this.loadingModalComponent = this._ionicApp.getComponent('loading');
  }

  showLoader() {
    if (this.loadingModalComponent) {
      setTimeout(() => {
        this.loadingModalComponent.show();
      },100);
    }
  }

  hideLoader() {
    if (this.loadingModalComponent) {
      setTimeout(() => {
        this.loadingModalComponent.hide();
      },100);
    }
  }

  popToRoot() {
    if (this.nav.canGoBack()) {
      this.nav.popToRoot();
    }
  }

  private getDefaultLanguage() {
    //Always return a language - get the browser's language
    var language = window.navigator.languages ? navigator.languages[0].toString() : (navigator.language || navigator.userLanguage)
    if (!language) {
      language = 'en';
    }
    if (language.length > 2) {
      language = language.toLowerCase().substring(0, 2);
    }

    return language;
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

  get config():Config {
    return this._config;
  }

  get events():Events {
    return this._events;
  }

  get nav():NavController {
    return this._nav;
  }

  get user():User {
    return this._user;
  }

  get isMenuOpen() {
    return this.menuController.isOpen();
  }

  get endPoint():String {
    return this.serverGateway.endPoint;
  }

  get settings():Settings {
    return this._settings;
  }

  get session():Session {
    return this._session;
  }

  get currentLanguage():Language {
    return this.settings.languages[this.user.settings.language];
  }

  get languageKeys():Array < String > {
    if (
      !this._languageKeys
    ) {
      this._languageKeys = Object.keys(this.settings.languages);
    }
    return this._languageKeys;
  }

  get canvasContext():any {
    return this._canvasContext;
  }

  translate(key:string, params ?:Object) {
    var translatedValue = this.settings.ui[this.user.settings.language][key];
    if (params) {
      translatedValue = translatedValue.format(params);
    }

    return translatedValue;
  }

  toggleSound() {
    return this.serverPost('user/toggleSound');
  }

  localSwitchLanguage(language:string) {
    localStorage.setItem('language', language);
    this.setDirection();
  }

  switchLanguage(language:string) {
    this.localSwitchLanguage(language);
    var postData = {'language': language};
    return this.serverPost('user/switchLanguage', postData);
  }

  logout() {
    this.serverGateway.token = null;
    this._session = null;
  }

  setLoggedUserId(userId: string) {
    window.FlurryAgent.setUserId(userId);
  }

  logEvent(eventName: string, eventParams?: Object) {
    if (eventParams) {
      window.FlurryAgent.logEvent(eventName, eventParams);
    }
    else {
      window.FlurryAgent.logEvent(eventName);
    }
  }

}

export class ServerGateway {

  http:Http;
  _endPoint:string;
  _token:string;
  _eventQueue:Array<InternalEvent>;

  constructor(http:Http) {
    this.http = http;

    if (!window.cordova) {
      //this._endPoint = 'http://www.topteamer.com/'
      this._endPoint = window.location.protocol + '//' + window.location.host + '/';
    }
    else {
      //TODO: change back to prod site
      this._endPoint = 'http://dev.topteamer.com/'
    }

    this._eventQueue = [];
  }

  get(path, timeout) {

    return new Promise((resolve, reject) => {
      var headers = new Headers();

      if (!timeout) {
        timeout = 10000;
      }

      if (this._token) {
        headers.append('Authorization', this._token);
      }

      this.http.get(path, {headers: headers})
        .timeout(timeout)
        .map((res:Response) => res.json())
        .subscribe((res:Object) => resolve(res),
          err => {
            reject(err);
          });
    });
  };

  post(path:string, postData:Object, timeout?:number, blockUserInterface?:boolean) {

    return new Promise((resolve, reject) => {

      var headers = new Headers();
      headers.append('Content-Type', 'application/json');

      if (this._token) {
        headers.append('Authorization', this._token);
      }

      if (!timeout) {
        timeout = 10000;
      }

      this.http.post(this._endPoint + path, JSON.stringify(postData), {headers: headers})
        .timeout(timeout)
        .map((res:Response) => res.json())
        .subscribe(
          (res:Object) => {
            if (res['serverPopup']) {
              this.eventQueue.push(new InternalEvent('topTeamer:serverPopup', res['serverPopup']));
            }
            resolve(res);
          },
          (err:Object) => {
            if (err['_body']) {
              reject(JSON.parse(err['_body']));
            }
            else {
              reject(err);
            }
          }
        );
    });
  };

  get endPoint():String {
    return this._endPoint;
  }

  get eventQueue():Array<InternalEvent> {
    return this._eventQueue;
  }

  set token(value:string) {
    this._token = value;
  }

}

export class InternalEvent {
  _eventName:String;
  _eventData:Object;

  constructor(eventName:String, eventData:Object) {
    this._eventName = eventName;
    this._eventData = eventData;
  }

  get eventName():String {
    return this._eventName;
  }

  get eventData():Object {
    return this._eventData;
  }

}

