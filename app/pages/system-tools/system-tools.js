var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var client_1 = require('../../providers/client');
var alertService = require('../../providers/alert');
var systemService = require('../../providers/system');
var SystemToolsPage = (function () {
    function SystemToolsPage() {
        this.client = client_1.Client.getInstance();
    }
    SystemToolsPage.prototype.ionViewWillEnter = function () {
        this.client.logEvent('page/systemTools');
    };
    SystemToolsPage.prototype.clearCache = function () {
        var _this = this;
        systemService.clearCache().then(function () {
            _this.client.nav.pop();
        });
    };
    SystemToolsPage.prototype.restart = function () {
        var _this = this;
        alertService.confirm('SYSTEM_RESTART_CONFIRM_TITLE', 'SYSTEM_RESTART_CONFIRM_TEMPLATE').then(function () {
            systemService.restart().then(function () {
                _this.client.nav.pop();
            });
        }, function () {
            //Do nothing on cancel
        });
    };
    SystemToolsPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/system-tools/system-tools.html'
        }), 
        __metadata('design:paramtypes', [])
    ], SystemToolsPage);
    return SystemToolsPage;
})();
exports.SystemToolsPage = SystemToolsPage;
//# sourceMappingURL=system-tools.js.map