import {App, IonicApp, Platform, Config} from 'ionic/ionic';
import {MainTabsPage} from './pages/main-tabs/main-tabs';
import {LoginPage} from './pages/login/login';
import * as facebookService from './providers/facebook';
import {Client} from './providers/client';
import {NavController,Menu} from "ionic-framework/ionic";

@App({
  templateUrl: 'app.html',
  moduleId: 'build/app.html',
  providers: [Client]
})
class topTeamerApp {

  pages:Array<Object>;
  client:Client;

  constructor(ionicApp:IonicApp, platform:Platform, client:Client) {

    this.client = client;

    // create an list of pages that can be navigated to from the menu
    // the menu only works after login
    // the login page disables the menu
    this.pages = [
      {title: 'RunningContests', page: MainTabsPage, icon: 'calendar'},
      {title: 'Login', page: LoginPage, icon: 'log-in'},
    ];

    client.init(ionicApp, platform).then(() => {
      this.initApp();
    });

  }

  openPage(page, isRoot, isFromMenu) {
    if (isRoot) {
      this.client.nav.setRoot(page).then(() => {
        if (isFromMenu) {
          this.client.menu.close();
        }
      });
    }
    else {
      this.nav.push(page.component).then(() => {
        if (isFromMenu) {
          this.menu.close();
        }
      })
    }
  }

  initApp() {

    //TODO: Global Exception handler - to write to flurry
    //TODO: Global page change detection to report to flurry about page navigations
    //TODO: Catch resume on mobile and call initBranch again
    //TODO: Catch http 401 errors and re-login
    //TODO: Catch server popup messages and display a modal popup.
    //TODO: Flurry events
    //TODO: Top bar with rank

    this.client.platform.ready().then(() => {

      this.declareStringFormat();
      this.declareRequestAnimationFrame();

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

      console.log("platform ready");
    });
  };

  initWeb() {

    //Resize app for web
    var containerWidth = window.innerWidth;

    var myApp = document.getElementById("myApp");
    if (myApp) {
      if (containerWidth > this.client.settings.general.webCanvasWidth) {
        myApp.style.width = this.client.settings.general.webCanvasWidth + "px";
        myApp.style.marginLeft = (containerWidth - this.client.settings.general.webCanvasWidth) / 2 + "px";
      }
    }

    //init facebook javascript sdk
    window.fbAsyncInit = () => {
      FB.init({
        appId: '344342552056',
        xfbml: true,
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
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

  }

  initMobile() {
    if (cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    //Must be set manually for keyboard issue when opened - to scroll elements of the focused field
    this.app.platform.isFullScreen = true;

    //Hook into window.open
    window.open = cordova.InAppBrowser.open;

    //Load branch mobile script
    loadJsFile("lib/branch/moblie.min.js");

    //Init android billing
    if (this.platform.is('android') && typeof inappbilling !== "undefined") {
      inappbilling.init((resultInit) => {
        },
        (errorInit) => {
          FlurryAgent.myLogError("InAppBilling", errorInit);
        }
        ,
        {showLog: true}, []
      );
    }

    cordova.getAppVersion((version) => {
      client.user.clientInfo.appVersion = version;
      FlurryAgent.setAppVersion("" + version);

      this.initFacebook();
    });

  }

  initFlurry() {

    //FlurryAgent.setDebugLogEnabled(true);
    FlurryAgent.startSession("NT66P8Q5BR5HHVN2C527");

    FlurryAgent.myLogError = (errorType, message) => {
      console.log(message);
      FlurryAgent.logError(errorType.substring(0, 255), message.substring(0, 255), 0);
    };
  }

  initBranch() {
    window.myHandleBranch = (err, data) => {
      try {
        if (err) {
          FlurryAgent.myLogError("BranchIoError", "Error received during branch init: " + err);
          return;
        }

        if (data.data_parsed && data.data_parsed.contestId) {
          //Will go to this contest
          //TODO: Deep linking
          client.deepLinkContestId = data.data_parsed.contestId;
        }
      }
      catch (e) {
        FlurryAgent.myLogError("BranchIoError", "Error parsing data during branch init, data= " + data + ", parsedData=" + parsedData + ", error: " + e);
      }

      window.initBranch = () => {
        branch.init("key_live_pocRNjTcwzk0YWxsqcRv3olivweLVuVE", (err, data) => {
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
          this.openPage(MainTabsPage, true, false);
        })
      }
      else {
        this.openPage(LoginPage, true, false)
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

  declareStringFormat() {

    if (!String.prototype.format) {
      String.prototype.format = function () {
        var args = arguments;
        var str = this;

        function replaceByObjectProperies(obj) {
          for (var property in obj)
            if (obj.hasOwnProperty(property))
            //replace all instances case-insensitive
              str = str.replace(new RegExp(escapeRegExp("{{" + property + "}}"), 'gi'), String(obj[property]));
        }

        function escapeRegExp(string) {
          return string.replace(/([.*+?^=!:${{}}()|\[\]\/\\])/g, "\\$1");
        }

        function replaceByArray(arrayLike) {
          for (var i = 0, len = arrayLike.length; i < len; i++)
            str = str.replace(new RegExp(escapeRegExp("{{" + i + "}}"), 'gi'), String(arrayLike[i]));
        }

        if (!arguments.length || arguments[0] === null || arguments[0] === undefined)
          return str;
        else if (arguments.length == 1 && Array.isArray(arguments[0]))
          replaceByArray(arguments[0]);
        else if (arguments.length == 1 && typeof arguments[0] === "object")
          replaceByObjectProperies(arguments[0]);
        else
          replaceByArray(arguments);

        return str;
      };
    }
  }
}
