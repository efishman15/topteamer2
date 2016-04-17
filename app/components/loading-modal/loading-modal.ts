import {Component} from 'angular2/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';

@Component({
  selector: 'loading-modal',
  templateUrl: 'build/components/loading-modal/loading-modal.html',
  directives: [IONIC_DIRECTIVES] // makes all Ionic directives available to your component
})
export class LoadingModalComponent {

  isBusy: boolean;

  constructor() {
    this.isBusy = false;
  }

  show(){
    this.isBusy = true;
  }

  hide(){
    this.isBusy = false;
  }

}
