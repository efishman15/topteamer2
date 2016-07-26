import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import {Push} from 'ionic-native';
import {App,Platform,Config, Nav, Alert, Modal, Events} from 'ionic-angular';
import * as contestsService from './contests';
import * as facebookService from './facebook';
import * as alertService from './alert';
import {User,Session,ClientInfo,Settings,Language,ThirdPartyInfo,Contest,ClientShareApp,AppPage} from '../objects/objects';
import {LoadingModalComponent} from '../components/loading-modal/loading-modal'
import * as classesService from './classes';

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

  _app:App;
  _platform:Platform;
  _config:Config;
  _events:Events;
  _nav:Nav;
  loadingModalComponent:LoadingModalComponent;
  _user:User;
  _session:Session;
  _settings:Settings;
  _loaded:Boolean = false;
  clientInfo:ClientInfo;
  _width:number;
  _chartWidth:number;
  _chartHeight:number;
  _deepLinkContestId:string;
  _shareApps:Array<ClientShareApp>;
  appPreloading:boolean = true;
  serverGateway:ServerGateway;
  pushService:any;

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
    }

    this.serverGateway = new ServerGateway(http);

  }

  static getInstance() {
    if (Client.instance == null) {
      Client.instance = this;
    }

    return Client.instance;
  }

  init(app:App, platform:Platform, config:Config, events:Events, nav:Nav, loadingModalComponent:LoadingModalComponent) {

    return new Promise((resolve, reject) => {

        this._app = app;
        this._platform = platform;
        this._config = config;
        this._events = events;
        this._nav = nav;
        this.loadingModalComponent = loadingModalComponent;

        if (this.clientInfo.mobile) {
          this._shareApps = new Array<ClientShareApp>();
          if (platform.is('android')) {
            this.clientInfo.platform = 'android';
          }
          else if (platform.is('ios')) {
            this.clientInfo.platform = 'ios';
          }
        }

        var language = localStorage.getItem('language');

        this.getSettings(language).then((data) => {

          this._settings = data['settings'];

          if (!language || language === 'undefined') {
            //Language was computed on the server using geoInfo or the fallback to the default language
            language = data['language'];
            localStorage.setItem('language', language);
          }

          this.initUser(language, data['geoInfo']);

          this.canvas = document.getElementById('playerInfoRankCanvas');
          this._canvasContext = this.canvas.getContext('2d');

          this.setDirection();

          this._loaded = true;

          this.adjustChartsDeviceSettings();

          Client.instance = this;

          resolve();
        }, (err) => reject(err));
      }
    );
  }

  initPlayerInfo() {
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

  clearXp() {
    this._canvasContext.clearRect(0, 0, this.settings.xpControl.canvas.width, this.settings.xpControl.canvas.height);
  }

  initXp() {
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

        this.user.settings = JSON.parse(JSON.stringify(data['session'].settings));

        this._session = data['session'];
        this.serverGateway.token = data['session'].token;

        this.setLoggedUserId(data['session'].userId);

        if (data['session'].justRegistered) {
          this.logEvent('server/register');
        }
        else {
          this.logEvent('server/login');
        }

        this.initPushService();

        resolve();

      }, (err) => {
        reject(err);
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
        else if (err.httpStatus) {
          //An error coming from our server
          //Display an alert or confirm message and continue the reject so further 'catch' blocks
          //will be invoked if any
          if (!err.additionalInfo || !err.additionalInfo.confirm) {
            alertService.alert(err).then(() => {
              reject(err);
            }, () => {
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
        else {
          alertService.alert({'type': 'SERVER_ERROR_GENERAL'}).then(() => {
            reject(err);
          }, () => {
            reject(err);
          });
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
    this.app.setTitle(this.translate(key, params));
  }

  openNewContest() {
    this.logEvent('menu/newContest');
    var modal = this.createModalPage('ContestTypePage');
    modal.onDismiss((contestTypeId) => {
      if (contestTypeId) {
        this.openPage('SetContestPage', {'mode': 'add', 'typeId': contestTypeId});
      }
    });
    return this.nav.present(modal);
  }

  displayContestById(contestId:string) {
    return new Promise((resolve:any, reject:any) => {
      contestsService.getContest(contestId).then((contest:Contest) => {
        resolve(contest);
        this.openPage('ContestPage', {'contest': contest});
      }, (err) => {
        reject(err)
      });
    });
  }

  showContest(contest:Contest, source:string, tryRun?:boolean) {

    return new Promise((resolve:any, reject:any) => {

      let now:number = (new Date()).getTime();

      let eventData:any = {
        'contestId': contest._id,
        'team': '' + contest.myTeam,
        'sourceClick': source
      }

      if (contest.state === 'play' && tryRun) {

        this.logEvent('contest/play', eventData);

        //Joined to a contest - run it immediately (go to the quiz)
        let appPages:Array<AppPage> = new Array<AppPage>();
        if (now - contest.lastUpdated < this.settings.contest.refreshTresholdInMilliseconds) {
          appPages.push(new AppPage('ContestPage', {'contest': contest}));
          appPages.push(new AppPage('QuizPage', {'contest': contest, 'source': 'list'}));
          this.insertPages(appPages);
          resolve();
        }
        else {
          contestsService.getContest(contest._id).then((serverContest:Contest) => {
            resolve(serverContest);
            appPages.push(new AppPage('ContestPage', {'contest': contest}));
            appPages.push(new AppPage('QuizPage', {'contest': contest, 'source': 'list'}));
            this.insertPages(appPages);
          }, (err) => {
            reject(err);
          });
        }
      }
      else if (now - contest.lastUpdated < this.settings.contest.refreshTresholdInMilliseconds) {
        //Not joined and no refresh required - enter the contest with the object we have
        resolve();
        this.logEvent('contest/show', eventData);
        this.openPage('ContestPage', {'contest': contest});
      }
      else {
        //Will enter the contest after retrieving it from the server
        this.logEvent('contest/show', eventData);
        this.displayContestById(contest._id).then((serverContest:Contest) => {
          resolve(serverContest);
        }, (err) => {
          reject(err);
        });
      }
    });
  }

  share(contest:Contest, source) {
    this.logEvent('share', {'source': source});
    this.openPage('SharePage', {'contest': contest, 'source': source});
  }

  getPage(name:string) {
    return classesService.get(name);
  }

  openPage(name:string, params?:any) {
    return this.nav.push(classesService.get(name), params);
  }

  createModalPage(name:string, params?:any) {
    return Modal.create(classesService.get(name), params);
  }

  showModalPage(name:string, params?:any) {
    var modal = this.createModalPage(name, params);
    return this.nav.present(modal);
  }

  setRootPage(name:string, params?:any) {
    return this.nav.setRoot(classesService.get(name), params);
  }

  insertPages(pages:Array<AppPage>, index?:number) {
    if (index === undefined) {
      index = -1; //Will insert at the end of the stack
    }

    this.nav.insertPages(index, this.getNavPages(pages));
  }

  setPages(pages:Array<AppPage>) {
    return this.nav.setPages(this.getNavPages(pages));
  }

  getNavPages(pages:Array<AppPage>) : Array<any> {

    let navPages:Array<any> = new Array<any>();
    pages.forEach((appPage:AppPage) => {
      navPages.push({page: this.getPage(appPage.page), params: appPage.params});
    });

    return navPages;
  }

  hidePreloader() {
    this.appPreloading = false;
    document.body.className = 'app-loaded';
  }

  resizeWeb() {
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
  }

  get width():number {
    var innerWidth = window.innerWidth;
    if (this._width > 0 && this._width < innerWidth) {
      return this._width;
    }
    else {
      return innerWidth;
    }
  }

  get height():number {
    return window.innerHeight;
  }

  get chartWidth():number {
    if (!this._chartWidth) {
      this._chartWidth = this.width * this.settings.charts.contest.size.widthRatio;
    }
    return this._chartWidth;
  }

  get chartHeight():number {
    if (!this._chartHeight) {
      this._chartHeight = this.width * this.settings.charts.contest.size.heightRatioFromWidth;
    }
    return this._chartHeight;
  }

  adjustChartsDeviceSettings() {

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

  }

  showLoader() {
    if (this.loadingModalComponent && !this.appPreloading) {
      setTimeout(() => {
        this.loadingModalComponent.show();
      }, 100);
    }
  }

  hideLoader() {
    if (this.loadingModalComponent && !this.appPreloading) {
      setTimeout(() => {
        this.loadingModalComponent.hide();
      }, 100);
    }
  }

  get shareApps():Array<ClientShareApp> {
    return this._shareApps;
  }

  set shareApps(value:Array<ClientShareApp>) {
    this._shareApps = value;
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

  get app():App {
    return this._app;
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

  get nav():Nav {
    return this._nav;
  }

  get user():User {
    return this._user;
  }

  get endPoint():String {
    return this.serverGateway.endPoint;
  }

  get settings():Settings {
    return this._settings;
  }

  set settings(value:Settings) {
    this._settings = value;
  }

  get session():Session {
    return this._session;
  }

  get currentLanguage():Language {
    return this.settings.languages[this.session ? this.session.settings.language : this.user.settings.language];
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

  get deepLinkContestId():string {
    return this._deepLinkContestId;
  }

  set deepLinkContestId(value:string) {
    this._deepLinkContestId = value;
  }

  translate(key:string, params ?:Object) {
    var language = (this.session ? this.session.settings.language : this.user.settings.language);
    var translatedValue = this.settings.ui[language][key];
    if (params) {
      translatedValue = translatedValue.format(params);
    }

    return translatedValue;
  }

  toggleSettings(name: string) {
    let postData : Object = {'name': name};
    return this.serverPost('user/toggleSettings', postData);
  }

  localSwitchLanguage(language:string) {
    localStorage.setItem('language', language);
    this.setDirection();
  }

  switchLanguage() {
    return new Promise((resolve, reject) => {
      var postData = {'language': this.user.settings.language};
      this.serverPost('user/switchLanguage', postData).then(() => {
        this.session.settings.language = this.user.settings.language;
        this.localSwitchLanguage(this.user.settings.language);
        this.logEvent('settings/language/change', {language: this.user.settings.language});
        resolve();
      }, (err) => {
        this.user.settings.language = this.session.settings.language;
        reject(err);
      });
    });
  }

  logout() {
    this.serverGateway.token = null;
    this._session = null;
    this.clearXp();
  }

  setLoggedUserId(userId:string) {
    window.FlurryAgent.setUserId(userId);
  }

  logEvent(eventName:string, eventParams?:Object) {
    if (eventParams) {
      window.FlurryAgent.logEvent(eventName, eventParams);
    }
    else {
      window.FlurryAgent.logEvent(eventName);
    }
  }

  getRecursiveProperty(object: any, property: string) : any {
    if (object && property) {
      let keys = property.split('.');
      let currentObject: any = object;
      for (var i=0; i<keys.length; i++) {
        if (!currentObject[keys[i]]) {
          return null;
        }
        currentObject = currentObject[keys[i]];
      }
      return currentObject;
    }
  }

  setRecursiveProperty(object: any, property: string, value: any) : any {
    if (object && property) {
      let keys = property.split('.');
      let currentObject: any = object;
      for (var i=0; i<keys.length; i++) {
        if (!currentObject[keys[i]]) {
          return;
        }
        if (i===keys.length-1) {
          //Last cycle - will exit loop
          currentObject[keys[i]] = value;
        }
      }
    }
  }

  initPushService() {
    if (this.clientInfo.platform === 'android') {
      //Push Service - init
      //Will have sound/vibration only if sounds are on
      this.settings.google.gcm.sound = this.session.settings.notifications.sound;
      this.settings.google.gcm.vibrate = this.session.settings.notifications.vibrate;
      this.pushService = Push.init(
        {
          'android': this.settings.google.gcm
        }
      );

      this.pushService.on('error', (error) => {
        window.myLogError('PushNotificationError', 'Error during push: ' + error.message);
      });

      //Push Service - registration
      this.pushService.on('registration', (registrationData) => {

        if (!registrationData || !registrationData.registrationId) {
          return;
        }

        localStorage.setItem('gcmRegistrationId', registrationData.registrationId);
        this.user.gcmRegistrationId = registrationData.registrationId;

        if (this.session && this.user.gcmRegistrationId &&
          (
            (this.session.gcmRegistrationId ||
            this.session.gcmRegistrationId !== this.user.gcmRegistrationId)
          )) {

          //If client has a registration Id and server has not / server has a different one
          //Update the server
          this.serverPost('user/setGcmRegistration', {'registrationId': this.user.gcmRegistrationId}).then(() => {
          }, () => {
          });
        }

      });

      //Push Service - notification
      this.pushService.on('notification', (notificationData) => {
        if (this.session && notificationData.additionalData && notificationData.additionalData.foreground) {
          //App is in the foreground - popup the alert
          var buttons:Array<Object> = null;
          if (notificationData.additionalData['contestId']) {
            buttons = new Array<Object>();
            buttons.push(
              {
                'text': notificationData.additionalData['buttonText'],
                'cssClass': notificationData.additionalData['buttonCssClass'],
                'handler': () => {
                  contestsService.getContest(notificationData.additionalData['contestId']).then((contest: Contest) => {
                    this.showContest(contest, 'push', true);
                  },() => {
                  })
                }
              });
            if (!notificationData.additionalData['hideNotNow']) {
              buttons.push(
                {
                  'text': this.translate('NOT_NOW'),
                  'role': 'cancel'
                }
              );
            }
          }
          alertService.alertTranslated(notificationData.title, notificationData.message, buttons).then(()=> {
          }, ()=> {
            //Notify push plugin that the 'notification' event has been handled
            this.pushService.finish(()=> {
            },()=>{
            });
          });
        }
        else if (notificationData.additionalData['contestId']) {
          //App is not running or in the background
          //Save deep linked contest id for later
          this.deepLinkContestId = notificationData.additionalData['contestId'];
          //Notify push plugin that the 'notification' event has been handled
          this.pushService.finish(()=> {
          },()=>{
          });
        }
      });

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
      this._endPoint = window.location.protocol + '//' + window.location.host + '/';
    }
    else {
      this._endPoint = 'http://www.topteamer.com/'
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
  _eventName:string;
  _eventData:Object;

  constructor(eventName:string, eventData:Object) {
    this._eventName = eventName;
    this._eventData = eventData;
  }

  get eventName():string {
    return this._eventName;
  }

  get eventData():Object {
    return this._eventData;
  }

}

