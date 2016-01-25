import {Component, Input, EventEmitter, Output} from 'angular2/core';
import {Client} from '../../providers/client';
import {Icon} from 'ionic/ionic';

@Component({
  selector: 'date-picker',
  templateUrl: 'build/components/date-picker/date-picker.html',
  directives: [Icon]
})

export class DatePickerComponent {

  @Input() options:Object;
  @Input() currentDate:Date;
  @Input() minDate:string;
  @Input() maxDate:string;
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

  constructor() {
    this.client = Client.getInstance();
  }

  ngOnInit() {
    this.hideCalendar = true;

    //Setting the input date for the date picker
    if (!this.currentDate) {
      this.currentDate = new Date();
      this.clearTime(this.currentDate);
    }

    this.displayedYear = this.currentDate.getFullYear();
    this.displayedMonth = this.currentDate.getMonth();

    this.monthsList = this.client.translate('DATE_PICKER_MONTH_NAMES');
    this.weekDays = this.client.translate('DATE_PICKER_WEEK_DAYS');

    if (this.minDate) {
      var minDate = new Date(this.minDate);
      this.clearTime(minDate);
      this.minEpochLocal = minDate.getTime();
    }
    if (this.maxDate) {
      var maxDate = new Date(this.maxDate);
      this.clearTime(maxDate);
      this.maxEpochLocal = maxDate.getTime();
    }

    this.rows = [];
    this.cols = [];
    this.rows.length = 6;
    this.cols.length = 7;

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
    this.clearTime(today);
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
        disabled: ( (this.minEpochLocal && epochLocal < this.minEpochLocal) || (this.maxEpochLocal || epochLocal > this.maxEpochLocal) ),
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
      this.dateSelected.next(cell);
      this.hideCalendar = true;
    }
  }

  clearTime(date: Date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

  }
}
