"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_angular_1 = require('ionic-angular');
var client_1 = require('../../providers/client');
var contestsService = require('../../providers/contests');
//Pages the server might want to redirect to
var contest_1 = require('../contest/contest');
var contest_participants_1 = require('../contest-participants/contest-participants');
var set_contest_1 = require('../set-contest/set-contest');
var settings_1 = require('../settings/settings');
var shareService = require('../../providers/share');
var ServerPopupPage = (function () {
    function ServerPopupPage(params, viewController) {
        this.client = client_1.Client.getInstance();
        this.serverPopup = params.data.serverPopup;
        //Look for special variables such as #storeLink (based on client's platform
        for (var i = 0; i < this.serverPopup.buttons.length; i++) {
            if (this.serverPopup.buttons[i].link && this.serverPopup.buttons[i].link.indexOf('#storeLink') >= 0) {
                this.serverPopup.buttons[i].link = this.serverPopup.buttons[i].link.replaceAll('#storeLink', this.client.settings.platforms[this.client.clientInfo.platform].storeLink);
            }
        }
        this.viewController = viewController;
    }
    ServerPopupPage.prototype.onPageWillEnter = function () {
        this.client.logEvent('page/serverPopup', { 'title': this.serverPopup.title, 'message': this.serverPopup.message });
    };
    ServerPopupPage.prototype.buttonAction = function (button) {
        var _this = this;
        switch (button.action) {
            case 'dismiss':
                this.viewController.dismiss(button);
                break;
            case 'link':
                {
                    window.open(button.link, '_system', 'location=yes');
                    this.viewController.dismiss(button);
                    break;
                }
            case 'linkExit':
                {
                    window.open(button.link, '_system', 'location=yes');
                    setTimeout(function () {
                        _this.client.platform.exitApp();
                    }, 1000);
                    break;
                }
            case 'share':
                {
                    if (button.contestId) {
                        contestsService.getContest(button.contestId).then(function (contest) {
                            _this.viewController.dismiss(button).then(function () {
                                shareService.share('serverPopup', contest);
                            });
                        });
                    }
                    else {
                        this.viewController.dismiss(button).then(function () {
                            shareService.share('serverPopup');
                        });
                    }
                    break;
                }
            case 'screen':
                {
                    var screen;
                    switch (button.screen) {
                        case 'ContestPage':
                            screen = contest_1.ContestPage;
                            break;
                        case 'ContestParticipantsPage':
                            screen = contest_participants_1.ContestParticipantsPage;
                            break;
                        case 'SetContestPage':
                            screen = set_contest_1.SetContestPage;
                            break;
                        case 'SettingsPage':
                            screen = settings_1.SettingsPage;
                            break;
                    }
                    this.viewController.dismiss(button).then(function () {
                        if (button.rootView) {
                            _this.client.nav.setRoot(screen, button.params);
                        }
                        else {
                            _this.client.nav.push(screen, button.params);
                        }
                    });
                    break;
                }
        }
    };
    ServerPopupPage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/server-popup/server-popup.html'
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavParams, ionic_angular_1.ViewController])
    ], ServerPopupPage);
    return ServerPopupPage;
}());
exports.ServerPopupPage = ServerPopupPage;
//# sourceMappingURL=server-popup.js.map