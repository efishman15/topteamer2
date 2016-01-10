import { Component, Input,Output, EventEmitter} from 'angular2/core';
import {SimpleTabsComponent} from '../simple-tabs/simple-tabs';

@Component({
  selector: 'simple-tab',
  templateUrl: 'build/components/simple-tab/simple-tab.html'
})

export class SimpleTabComponent {

  @Input() simpleTabTitle: string;
  @Input() active = this.active || false;

  @Output() selected = new EventEmitter();

  constructor(simpleTabs: SimpleTabsComponent){

    simpleTabs.addTab(this);

  }

  get selectedEmitter() : EventEmitter {
    return this.selected;
  }
}
