import {Directive, Output, EventEmitter} from 'angular2/core';

@Directive({
  selector: "[transition-end]",
  hostListeners: {
    'transitionend': 'transitionEnd()',
    'webkitTransitionEnd': 'transitionEnd()',
    'oTransitionEnd': 'transitionEnd()'
  }
})

export class TransitionEndDirective {

  @Output() transitionEnd = new EventEmitter();

  constructor() {

  }

  transitionEnded()  {
    this.transitionEnd.next();
  }
}
