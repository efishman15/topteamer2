import {Component,provide,ExceptionHandler,ViewChild} from '@angular/core';
import {MyExceptionHandler} from './providers/exceptions';
import {ionicBootstrap, App, Platform, Config, Events, Nav} from 'ionic-angular';
import {Client} from './providers/client';
import * as facebookService from './providers/facebook';
import * as shareService from './providers/share';
import {LoadingModalComponent} from './components/loading-modal/loading-modal';
import * as alertService from './providers/alert';
import {} from './interfaces/interfaces'
import {AppVersion} from 'ionic-native';

@Component({
  templateUrl: 'build/app.html',
  directives: [LoadingModalComponent]
})
export class TopTeamerApp {

  client:Client;
  deepLinkContestId: string;
  @ViewChild(Nav) nav:Nav;
  @ViewChild(LoadingModalComponent) loadingModalComponent:LoadingModalComponent;

  app: App;
  platform: Platform;
  config: Config;
  events: Events;
  isMenuOpen: boolean;

  constructor(app:App, platform:Platform, config: Config, client:Client, events:Events) {

    this.app = app;
    this.platform = platform;
    this.config = config;
    this.client = client;
    this.events = events;
  }

  ngAfterViewInit() {
    this.client.init(this.app, this.platform, this.config, this.events, this.nav, this.loadingModalComponent).then(() => {
      this.initApp();
    });
  }

  initApp() {

    //TODO: Hardware back button
    //TODO: navigate to PurchaseSuccess based on url params (if coming from paypal)

    this.client.platform.ready().then(() => {

      this.expandStringPrototype();
      this.declareRequestAnimationFrame();
      this.expandDatePrototype();

      this.initFlurry();

      if (!window.cordova) {
        this.initWeb();
      }
      else {
        this.initMobile();
      }

      this.initBranch();

      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        window.StatusBar.styleDefault();
      }

      //Handle hardware back button
      document.addEventListener('backbutton', (event: Event) => {

        event.cancelBubble = true;
        event.preventDefault();

        var client = Client.getInstance();
        var activeNav = client.nav;

        var activeView = activeNav.getActive();
        if (activeView) {
          if (!activeView.isRoot()) {
            return activeView.dismiss();
          }
          var page = activeView.instance;
          if (page instanceof client.getPage('MainTabsPage') && page['mainTabs']) {
            activeNav = page['mainTabs'].getSelected();
          }
        }

        if (activeNav.canGoBack()) {
          // Detected a back button press outside of tabs page - popping a view from a navigation stack.
          return activeNav.pop();
        }
        // Exiting app due to back button press at the root view
        return alertService.confirmExitApp();
      }, false);
      this.client.hideLoader();
      console.log('platform ready');

    });
  };

  initWeb() {

    window.addEventListener('resize', (event) => {
      var client = Client.getInstance();
      client.resizeWeb();
    });

    this.client.resizeWeb();

    //Load branch mobile script
    window.loadJsFile('lib/branch/web.min.js');

    //init facebook javascript sdk
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: '344342552056',
        xfbml: true,
        cookie: true,
        version: 'v2.5'
      });

      this.initFacebook();
    };

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = '//connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  initMobile() {
    if (window.cordova.plugins.Keyboard) {
      window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      window.cordova.plugins.Keyboard.disableScroll(false);
    }

    //Must be set manually for keyboard issue when opened - to scroll elements of the focused field
    //TODO: check if Platform.prototype.fullScreen is required - to return true always

    //Hook into window.open
    window.open = window.cordova.InAppBrowser.open;

    //Load branch mobile script
    window.loadJsFile('lib/branch/moblie.min.js');

    //Init android billing
    if (this.client.platform.is('android') && typeof window.inappbilling !== 'undefined') {
      window.inappbilling.init((resultInit) => {
        },
        (errorInit) => {
          window.myLogError('InAppBilling', errorInit);
        }
        ,
        {showLog: true}, []
      );
    }

    document.addEventListener('resume', function (event) {
      if (window.initBranch) {
        window.initBranch();
      }
    });

    AppVersion.getVersionNumber().then((version) => {
      this.client.user.clientInfo.appVersion = version;
      window.FlurryAgent.setAppVersion('' + version);
      this.initFacebook();
    });
  }

  initFlurry() {

    //FlurryAgent.setDebugLogEnabled(true);
    window.FlurryAgent.startSession('NT66P8Q5BR5HHVN2C527');

    window.myLogError = (errorType: string, message: string) => {
      window.FlurryAgent.logError(errorType.substring(0, 255), message.substring(0, 255), 0);
    }

  }

  initBranch() {
    window.myHandleBranch = (err, data) => {
      try {
        if (err) {
          window.myLogError('BranchIoError', 'Error received during branch init: ' + err);
          return;
        }

        if (data.data_parsed && data.data_parsed.contestId) {
          //Will go to this contest
          //TODO: QA - Deep linking
          this.deepLinkContestId = data.data_parsed.contestId;
          console.log('got contest id: ' + this.deepLinkContestId)
        }
      }
      catch (e) {
        window.myLogError('BranchIoError', 'Error parsing data during branch init, data= ' + data + ', parsedData=' + data.data_parsed + ', error: ' + e);
      }
    }

    window.initBranch = () => {
      if (window.branch) {
        window.branch.init('key_live_pocRNjTcwzk0YWxsqcRv3olivweLVuVE', (err, data) => {
          if (window.myHandleBranch) {
            window.myHandleBranch(err, data);
          }
        });
      }
      else {
        console.log('branch script not loaded - retrying in 2000 ms.');
        setTimeout(() => {
          window.initBranch();
        },2000)
      }
    }

    //Give the appropriate mobile/web branch js file time to load
    setTimeout(() => {
      window.initBranch();
    },2000)

  }

  initFacebook() {
    facebookService.getLoginStatus().then((result) => {
      if (result['connected']) {
        this.client.facebookServerConnect(result['response'].authResponse).then(() => {
          this.client.setRootPage('MainTabsPage').then(() => {
            if (this.deepLinkContestId) {
              this.client.displayContest(this.deepLinkContestId);
            }
          });
        })
      }
      else {
        this.client.openPage('LoginPage');
      }
    });
  }

  declareRequestAnimationFrame() {

    // Fallback where requestAnimationFrame or its equivalents are not supported in the current browser
    window.myRequestAnimationFrame = (() => {
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60);
        };
    })();
  }

  expandStringPrototype() {

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
  }

  expandDatePrototype() {
    if (!Date.prototype.clearTime) {
      Date.prototype.clearTime = function () {
        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);
      }
    }
  }

  share() {
    this.client.logEvent('menu/share');
    shareService.share('menu');
  }

  settings() {
    this.client.logEvent('menu/settings');
    this.client.openPage('SettingsPage');
  }

  systemTools() {
    this.client.logEvent('menu/systemTools');
    this.client.openPage('SystemToolsPage');
  }

  menuOpened(opened: boolean) {
    this.isMenuOpen = opened;
  }
}

ionicBootstrap(TopTeamerApp, [provide(ExceptionHandler, {useClass: MyExceptionHandler}),Client], {
  backButtonText:'', prodMode: true
});
