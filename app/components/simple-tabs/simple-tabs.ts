import {Component, Output} from '@angular/core';
import { SimpleTabComponent } from '../simple-tab/simple-tab';

@Component({
  selector: 'simple-tabs',
  templateUrl: 'build/components/simple-tabs/simple-tabs.html'
})
export class SimpleTabsComponent {

  simpleTabs: SimpleTabComponent[];

  constructor() {
    this.simpleTabs = [];
  }

  selectTab(simpleTab){

    _deactivateAllTabs(this.simpleTabs);
    simpleTab.active = true;

    function _deactivateAllTabs(simpleTabs: SimpleTabComponent[]){
      simpleTabs.forEach((simpleTab)=>simpleTab.isActive = false);
    }

    //Bubble the event outside
    simpleTab.selected.emit();
  }

  addTab(simpleTab: SimpleTabComponent) {
    if (this.simpleTabs.length === 0) {
      simpleTab.active = true;
    }
    this.simpleTabs.push(simpleTab);
  }

  switchToTab(tabId : number) {
    if (tabId >= 0 && tabId < this.simpleTabs.length) {
      this.selectTab(this.simpleTabs[tabId]);
    }
  }
}
