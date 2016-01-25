import {Component, Input, EventEmitter, Output} from 'angular2/core';
import {Client} from '../../providers/client';
import {List, RadioButton} from 'ionic/ionic';

@Component({
  selector: 'item-selection',
  templateUrl: 'build/components/item-selection/item-selection.html',
  directives: [List, RadioButton]
})

export class ItemSelectionComponent {

  @Input() width:Number;
  @Input() title:String;
  @Input() items: Array<Object>;
  @Input() value:any;
  @Output() itemSelected = new EventEmitter();

  client:Client;
  hideList:boolean;
  selectedItem:Object;

  constructor() {
    this.client = Client.getInstance();
  }

  ngOnInit() {
    this.hideList = true;

    for(var i=0; i<this.items.length; i++) {
      if (this.items[i].value === this.value) {
        this.selectedItem = this.items[i];
        break;
      }
    }
  };

  toggleList() {
    this.hideList = !this.hideList;
  }

  pickItem(item) {
    this.value = item.value;
    this.toggleList();
    this.itemSelected.next(item);
  }

  getArrowDirection(stateClosed) {
    if (stateClosed) {
      if (this.client.currentLanguage.direction === 'ltr') {
        return "►";
      }
      else {
        return "◄";
      }
    }
    else {
      return "▼";
    }
  }

}
