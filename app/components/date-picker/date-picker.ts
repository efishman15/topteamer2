import {Component, Input, EventEmitter, Output} from 'angular2/core';
import {Client} from '../../providers/client';
import {Icon} from 'ionic/ionic';

@Component({
  selector: 'date-picker',
  templateUrl: 'build/components/date-picker/date-picker.html',
  directives: [Icon]
})

export class DatePickerComponent {

  @Input() currentDate:Date;
  @Input() minDate:Date;
  @Input() maxDate:Date;
  @Input() currentDateClass:String;
  @Output() dateSelected = new EventEmitter();

  client:Client;
  hideCalendar:boolean;
  displayedYear:number;
  displayedMonth:number;

  monthsList:Array<string>;
  weekDays:Array<string>;
  calendar:Array<Object>;
  rows:Array<any>;
  cols:Array<any>;
  minEpochLocal:any;
  maxEpochLocal:any;
  currentDateFormatted: string;

  constructor() {
    this.client = Client.getInstance();
  }

  ngOnInit() {
    this.hideCalendar = true;

    //Setting the input date for the date picker
    if (!this.currentDate) {
      this.currentDate = new Date();
      this.currentDate.clearTime();
    }

    this.displayedYear = this.currentDate.getFullYear();
    this.displayedMonth = this.currentDate.getMonth();

    this.monthsList = this.client.translate('DATE_PICKER_MONTH_NAMES');
    this.weekDays = this.client.translate('DATE_PICKER_WEEK_DAYS');

    this.rows = [];
    this.cols = [];
    this.rows.length = 6;
    this.cols.length = 7;

    this.setDateLimits();

    this.formatSelectedDate();

  };

  toggleCalendar() {
    this.hideCalendar = !this.hideCalendar;
    if (!this.hideCalendar) {
      this.displayedYear = this.currentDate.getFullYear();
      this.displayedMonth = this.currentDate.getMonth();
      this.refreshMonth();
    }
  }

  prevMonth() {
    if (this.displayedMonth === 0) {
      this.displayedYear--;
      this.displayedMonth = 11;
    }
    else {
      this.displayedMonth--;
    }
    this.refreshMonth();
  };

  nextMonth() {
    if (this.displayedMonth === 11) {
      this.displayedYear++;
      this.displayedMonth = 0;
    }
    else {
      this.displayedMonth++;
    }
    this.refreshMonth();
  };

  prevYear() {
    this.displayedYear--;
    this.refreshMonth();
  };

  nextYear() {
    this.displayedYear++;
    this.refreshMonth();
  };

  refreshMonth() {

    var firstDateOfTheMonth = new Date(this.displayedYear, this.displayedMonth, 1);
    var lastDateOfTheMonth = new Date(this.displayedYear, this.displayedMonth + 1, 0);
    var daysOffsetStart = firstDateOfTheMonth.getDay();
    var firstDayOfTheCalendar = new Date(firstDateOfTheMonth.getFullYear(), firstDateOfTheMonth.getMonth(), firstDateOfTheMonth.getDate() - daysOffsetStart);
    var totalDays = this.rows.length * this.cols.length;

    this.calendar = [];

    var currentEpoch = this.currentDate.getTime();
    var today = new Date();
    today.clearTime();
    var todayEpoch = today.getTime();

    for (var i = 0; i < totalDays; i++) {
      var cellDate = new Date(firstDayOfTheCalendar.getFullYear(), firstDayOfTheCalendar.getMonth(), firstDayOfTheCalendar.getDate() + i, 0, 0, 0);
      var epochLocal = cellDate.getTime();

      this.calendar.push({
        dateObject: cellDate,
        date: cellDate.getDate(),
        month: cellDate.getMonth(),
        year: cellDate.getFullYear(),
        day: cellDate.getDay(),
        dateString: cellDate.toString(),
        epochLocal: epochLocal,
        epochUTC: (cellDate.getTime() + (cellDate.getTimezoneOffset() * 60 * 1000)),
        inMonth: (epochLocal >= firstDateOfTheMonth.getTime() && epochLocal <= lastDateOfTheMonth.getTime()),
        disabled: ( (this.minEpochLocal && epochLocal < this.minEpochLocal) || (this.maxEpochLocal && epochLocal > this.maxEpochLocal) ),
        selected: (epochLocal === currentEpoch),
        today: (epochLocal === todayEpoch)
      });
    }
  }

  getCell(row, col) {
    return this.calendar[(row * this.cols.length) + col];
  }

  pickDate(row, col) {
    var cell = this.getCell(row, col);
    if (!cell.disabled) {
      this.currentDate = cell.dateObject;
      this.formatSelectedDate();
      this.hideCalendar = true;
      this.dateSelected.emit(cell);
    }
  }

  formatSelectedDate() {
    this.currentDateFormatted = this.currentDate.toLocaleDateString(this.client.currentLanguage.locale,this.client.currentLanguage.localeDateOptions);
  }

  setDateLimits() {
    if (this.minDate) {
      var minDate = new Date(this.minDate);
      minDate.clearTime();
      this.minEpochLocal = minDate.getTime();
    }

    if (this.maxDate) {
      var maxDate = new Date(this.maxDate);
      maxDate.clearTime();
      this.maxEpochLocal = maxDate.getTime();
    }
  }
}
