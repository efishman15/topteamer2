import { Component, Input,Output, EventEmitter} from '@angular/core';
import {SimpleTabsComponent} from '../simple-tabs/simple-tabs';

@Component({
  selector: 'simple-tab',
  templateUrl: 'build/components/simple-tab/simple-tab.html'
})

export class SimpleTabComponent {

  @Input() simpleTabTitle: string;
  @Input() active = this.active || false;

  @Output() selected = new EventEmitter();
  _active: Boolean;

  constructor(simpleTabs: SimpleTabsComponent){
    simpleTabs.addTab(this);
  }

  get isActive() : Boolean {
    return this.active;
  }

  set isActive(value: Boolean) {
    this.active = value;
  }
}
