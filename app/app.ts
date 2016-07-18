import {Component,provide,ExceptionHandler,ViewChild} from '@angular/core';
import {MyExceptionHandler} from './providers/exceptions';
import {ionicBootstrap, App, Platform, Config, Events, Nav, ViewController, NavController} from 'ionic-angular';
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
  @ViewChild(Nav) nav:Nav;
  @ViewChild(LoadingModalComponent) loadingModalComponent:LoadingModalComponent;

  app: App;
  platform: Platform;
  config: Config;
  events: Events;

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
    },(err) => this.ngAfterViewInit());
  }

  initApp() {

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
      this.client.platform.registerBackButtonAction( () => {

        var client = Client.getInstance();
        var activeNav = client.nav;

        //Modal - dismiss
        let portalNav : NavController = activeNav.getPortal();
        if (portalNav.hasOverlay()) {
          let activeView : ViewController = portalNav.getActive();
          if (activeView && activeView.instance && activeView.instance['preventBack'] && activeView.instance['preventBack']()) {
            return; //prevent back
          }
          return activeView.dismiss();
        }

        //Root screen - confirm exit app
        if (!activeNav.canGoBack()) {
          return alertService.confirmExitApp();
        }

        //Go back
        return activeNav.pop();

      });

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
        appId: this.client.settings.facebook.appId,
        xfbml: true,
        cookie: true,
        version: this.client.settings.facebook.version
      });

      this.initFacebook();
    };

    (function (d, s, id) {
      var client = Client.getInstance();
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = client.settings.facebook.sdk;
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  initMobile() {

    //Will discover which apps are installed (from a server list) and support sharing
    shareService.mobileDiscoverSharingApps();

    if (window.cordova.plugins.Keyboard) {
      window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      window.cordova.plugins.Keyboard.disableScroll(false);
    }

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
    window.FlurryAgent.startSession(this.client.settings.flurry.key);

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
          if (this.client.session) {
            this.client.displayContestById(data.data_parsed.contestId).then(() => {
            }, () => {
            });
          }
          else {
            this.client.deepLinkContestId = data.data_parsed.contestId;
          }
        }
      }
      catch (e) {
        window.myLogError('BranchIoError', 'Error parsing data during branch init, data= ' + data + ', parsedData=' + data.data_parsed + ', error: ' + e);
      }
    }

    window.initBranch = () => {
      if (window.branch) {
        window.branch.init(this.client.settings.branch.key, (err, data) => {
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
          this.client.setRootPage('MainTabsPage');
        },(err) => {
          this.client.openPage('LoginPage');
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
    this.client.share(null, 'menu');
  }

  settings() {
    this.client.logEvent('menu/settings');
    this.client.openPage('SettingsPage');
  }

  systemTools() {
    this.client.logEvent('menu/systemTools');
    this.client.openPage('SystemToolsPage');
  }
}

ionicBootstrap(TopTeamerApp, [provide(ExceptionHandler, {useClass: MyExceptionHandler}),Client], {
  backButtonText:'', prodMode: true, navExitApp: false
});
