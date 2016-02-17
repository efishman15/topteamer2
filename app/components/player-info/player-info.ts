import {Client} from '../../providers/client';
import {Component} from "angular2/core";

@Component({
  selector: 'player-info',
  templateUrl: 'build/components/player-info/player-info.html'
})

export class PlayerInfoComponent {

  client:Client;
  canvas:any;
  context:any;

  circle:number = Math.PI * 2;
  quarter:number = Math.PI / 2;

  centerX:number;
  centerY:number;

  constructor() {
    this.client = Client.getInstance();
  }

  ngOnInit() {
    this.canvas = document.getElementById('playerInfoRankCanvas');
    this.context = this.canvas.getContext('2d');

    this.initXp();
  }

  initXp() {
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
  }

  animateXpAddition(startPoint, endPoint) {

    this.context.beginPath();
    this.context.arc(this.centerX, this.centerY, this.client.settings.xpControl.radius, (this.circle * startPoint) - this.quarter, (this.circle * endPoint) - this.quarter, false);
    this.context.strokeStyle = this.client.settings.xpControl.progressLineColor;
    this.context.stroke();
    this.context.closePath();
  }

  addXp(xpProgress) {

    return new Promise((resolve, reject) => {

      var startPoint = this.client.session.xpProgress.current / this.client.session.xpProgress.max;

      //Occurs after xp has already been added to the session
      var addition = xpProgress.addition;
      for (var i = 1; i <= addition; i++) {
        myRequestAnimationFrame(() => {
          var endPoint = (this.client.session.xpProgress.current + i) / this.client.session.xpProgress.max;
          this.animateXpAddition(startPoint, endPoint, this.quarter, this.circle);

          //Last iteration should be performed after the animation frame event happened
          if (i >= addition) {

            //Add the actual xp to the client side
            this.client.session.xpProgress = xpProgress;

            //Zero the addition
            this.client.session.xpProgress.addition = 0;

            if (xpProgress.rankChanged) {
              this.client.session.rank = xpProgress.rank;
              this.initXp();
            }
          }
        })
      }
      resolve();
    });

  }

}
