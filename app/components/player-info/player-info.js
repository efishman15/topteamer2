var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var client_1 = require('../../providers/client');
var core_1 = require("angular2/core");
var PlayerInfoComponent = (function () {
    function PlayerInfoComponent() {
        this.circle = Math.PI * 2;
        this.quarter = Math.PI / 2;
        this.client = client_1.Client.getInstance();
    }
    PlayerInfoComponent.prototype.ngOnInit = function () {
        this.canvas = document.getElementById('playerInfoRankCanvas');
        this.context = this.canvas.getContext('2d');
        this.initXp();
    };
    PlayerInfoComponent.prototype.initXp = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        //-------------------------------------------------------------------------------------
        // Draw the full circle representing the entire xp required for the next level
        //-------------------------------------------------------------------------------------
        this.context.beginPath();
        this.context.arc(this.centerX, this.centerY, this.client.settings.xpControl.radius, 0, this.circle, false);
        this.context.fillStyle = this.client.settings.xpControl.fillColor;
        this.context.fill();
        //Full line color
        this.context.lineWidth = this.client.settings.xpControl.lineWidth;
        this.context.strokeStyle = this.client.settings.xpControl.fullLineColor;
        this.context.stroke();
        this.context.closePath();
        //-------------------------------------------------------------------------------------
        //Draw the arc representing the xp in the current level
        //-------------------------------------------------------------------------------------
        this.context.beginPath();
        // line color
        this.context.arc(this.centerX, this.centerY, this.client.settings.xpControl.radius, -(this.quarter), ((this.client.session.xpProgress.current / this.client.session.xpProgress.max) * this.circle) - this.quarter, false);
        this.context.strokeStyle = this.client.settings.xpControl.progressLineColor;
        this.context.stroke();
        //Rank Text
        var font = '';
        if (this.client.settings.xpControl.font.bold) {
            font += 'bold ';
        }
        var fontSize;
        if (this.client.session.rank < 10) {
            //1 digit font
            fontSize = this.client.settings.xpControl.font.d1;
        }
        else if (this.client.session.rank < 100) {
            //2 digits font
            fontSize = this.client.settings.xpControl.font.d2;
        }
        else {
            fontSize = this.client.settings.xpControl.font.d3;
        }
        font += fontSize + ' ';
        font += this.client.settings.xpControl.font.name;
        this.context.font = font;
        // Move it down by half the text height and left by half the text width
        var rankText = '' + this.client.session.rank;
        var textWidth = this.context.measureText(rankText).width;
        var textHeight = this.context.measureText('w').width;
        this.context.fillStyle = this.client.settings.xpControl.textColor;
        this.context.fillText(rankText, this.centerX - (textWidth / 2), this.centerY + (textHeight / 2));
        this.context.closePath();
    };
    PlayerInfoComponent.prototype.animateXpAddition = function (startPoint, endPoint) {
        this.context.beginPath();
        this.context.arc(this.centerX, this.centerY, this.client.settings.xpControl.radius, (this.circle * startPoint) - this.quarter, (this.circle * endPoint) - this.quarter, false);
        this.context.strokeStyle = this.client.settings.xpControl.progressLineColor;
        this.context.stroke();
        this.context.closePath();
    };
    PlayerInfoComponent.prototype.addXp = function (xpProgress) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var startPoint = _this.client.session.xpProgress.current / _this.client.session.xpProgress.max;
            //Occurs after xp has already been added to the session
            var addition = xpProgress.addition;
            for (var i = 1; i <= addition; i++) {
                myRequestAnimationFrame(function () {
                    var endPoint = (_this.client.session.xpProgress.current + i) / _this.client.session.xpProgress.max;
                    _this.animateXpAddition(startPoint, endPoint, _this.quarter, _this.circle);
                    //Last iteration should be performed after the animation frame event happened
                    if (i >= addition) {
                        //Add the actual xp to the client side
                        _this.client.session.xpProgress = xpProgress;
                        //Zero the addition
                        _this.client.session.xpProgress.addition = 0;
                        if (xpProgress.rankChanged) {
                            _this.client.session.rank = xpProgress.rank;
                            _this.initXp();
                        }
                    }
                });
            }
            resolve();
        });
    };
    PlayerInfoComponent = __decorate([
        core_1.Component({
            selector: 'player-info',
            templateUrl: 'build/components/player-info/player-info.html'
        }), 
        __metadata('design:paramtypes', [])
    ], PlayerInfoComponent);
    return PlayerInfoComponent;
})();
exports.PlayerInfoComponent = PlayerInfoComponent;
