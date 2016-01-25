var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var client_1 = require('../../providers/client');
var ionic_1 = require('ionic/ionic');
var ItemSelectionComponent = (function () {
    function ItemSelectionComponent() {
        this.itemSelected = new core_1.EventEmitter();
        this.client = client_1.Client.getInstance();
    }
    ItemSelectionComponent.prototype.ngOnInit = function () {
        this.hideList = true;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].value === this.value) {
                this.selectedItem = this.items[i];
                break;
            }
        }
    };
    ;
    ItemSelectionComponent.prototype.toggleList = function () {
        this.hideList = !this.hideList;
    };
    ItemSelectionComponent.prototype.pickItem = function (item) {
        this.value = item.value;
        this.toggleList();
        this.itemSelected.next(item);
    };
    ItemSelectionComponent.prototype.getArrowDirection = function (stateClosed) {
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
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], ItemSelectionComponent.prototype, "width", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], ItemSelectionComponent.prototype, "title", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], ItemSelectionComponent.prototype, "items", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ItemSelectionComponent.prototype, "value", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ItemSelectionComponent.prototype, "itemSelected", void 0);
    ItemSelectionComponent = __decorate([
        core_1.Component({
            selector: 'item-selection',
            templateUrl: 'build/components/item-selection/item-selection.html',
            directives: [ionic_1.List, ionic_1.RadioButton]
        }), 
        __metadata('design:paramtypes', [])
    ], ItemSelectionComponent);
    return ItemSelectionComponent;
})();
exports.ItemSelectionComponent = ItemSelectionComponent;
