import {provide,ExceptionHandler} from 'angular2/core';
import {MyExceptionHandler} from './providers/exceptions';
import {App, IonicApp, Platform, Config, Events, Modal, Alert, NavController, MenuController} from 'ionic/ionic';
import {MainTabsPage} from './pages/main-tabs/main-tabs';
import {LoginPage} from './pages/login/login';
import * as facebookService from './providers/facebook';
import * as shareService from './providers/share';
import {Client} from './providers/client';
import {ContestTypePage} from './pages/contest-type/contest-type';
import {SetContestPage} from './pages/set-contest/set-contest';
import {SettingsPage} from './pages/settings/settings';
import {SystemToolsPage} from './pages/system-tools/system-tools';

@App({
  templateUrl: 'app.html',
  moduleId: 'build/app.html',
  providers: [provide(ExceptionHandler, {useClass: MyExceptionHandler}), Client],
  config: {backButtonText: ''}
})
class topTeamerApp {

  client:Client;

  constructor(ionicApp:IonicApp, platform:Platform, config: Config, client:Client, events:Events, menuController:MenuController) {

    this.client = client;

    client.init(ionicApp, platform, config, menuController, events).then(() => {
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
        StatusBar.styleDefault();
      }

      console.log('platform ready');
    });
  };

  initWeb() {

    //Resize app for web
    var containerWidth = window.innerWidth;

    var myApp = document.getElementById('myApp');
    if (myApp) {
      if (containerWidth > this.client.settings.general.webCanvasWidth) {
        myApp.style.width = this.client.settings.general.webCanvasWidth + 'px';
        myApp.style.marginLeft = (containerWidth - this.client.settings.general.webCanvasWidth) / 2 + 'px';
      }
    }

    //Load branch mobile script
    loadJsFile('lib/branch/web.min.js');

    //init facebook javascript sdk
    window.fbAsyncInit = () => {
      FB.init({
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
    if (cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    //Must be set manually for keyboard issue when opened - to scroll elements of the focused field
    this.client.platform.prototype.fullScreen = () => {
      return true;
    };

    //Hook into window.open
    window.open = cordova.InAppBrowser.open;

    //Load branch mobile script
    loadJsFile('lib/branch/moblie.min.js');

    //Init android billing
    if (this.client.platform.is('android') && typeof inappbilling !== 'undefined') {
      inappbilling.init((resultInit) => {
        },
        (errorInit) => {
          this.client.logError('InAppBilling', errorInit);
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

    cordova.getAppVersion((version) => {
      this.client.user.clientInfo.appVersion = version;
      FlurryAgent.setAppVersion('' + version);

      this.initFacebook();
    });
  }

  initFlurry() {

    //FlurryAgent.setDebugLogEnabled(true);
    FlurryAgent.startSession('NT66P8Q5BR5HHVN2C527');
  }

  initBranch() {
    window.myHandleBranch = (err, data) => {
      try {
        if (err) {
          this.client.logError('BranchIoError', 'Error received during branch init: ' + err);
          return;
        }

        if (data.data_parsed && data.data_parsed.contestId) {
          //Will go to this contest
          //TODO: Deep linking
          this.client.deepLinkContestId = data.data_parsed.contestId;
        }
      }
      catch (e) {
        this.client.logError('BranchIoError', 'Error parsing data during branch init, data= ' + data + ', parsedData=' + data.data_parsed + ', error: ' + e);
      }

      window.initBranch = () => {
        branch.init('key_live_pocRNjTcwzk0YWxsqcRv3olivweLVuVE', (err, data) => {
          if (window.myHandleBranch) {
            window.myHandleBranch(err, data);
          }
        });
      }
    };
  }

  initFacebook() {
    facebookService.getLoginStatus().then((result) => {
      if (result.connected) {
        this.client.facebookServerConnect(result.response.authResponse).then(() => {
          this.client.nav.push(MainTabsPage);
        })
      }
      else {
        this.client.nav.push(LoginPage);
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

  newContest() {
    this.client.logEvent('menu/newContest');
    var modal = Modal.create(ContestTypePage);
    modal.onDismiss((contestType) => {
      if (contestType) {
        setTimeout(() => {
          this.client.nav.push(SetContestPage, {'mode': 'add', 'type': contestType});
        }, 500);
      }
    });
    this.client.nav.present(modal);
  }

  share() {
    this.client.logEvent('menu/share');
    shareService.share('menu');
  }

  settings() {
    this.client.logEvent('menu/settings');
    this.client.nav.push(SettingsPage);
  }

  systemTools() {
    this.client.logEvent('menu/systemTools');
    this.client.nav.push(SystemToolsPage);
  }
}

