import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit
} from '@angular/core';

import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView
} from 'angular-calendar';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppServiceService } from 'src/app/app-service.service';
import { EventColor, EventAction } from 'calendar-utils';
import { SocketService } from 'src/app/socket.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';


import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';
import { DatePipe } from '@angular/common';
import { LOCALE_ID, Inject } from '@angular/core';
import { CalendarEventTitleFormatter } from 'angular-calendar';
import { GlobalConfig } from 'src/app/globalConfig';

export class CustomDateFormatter extends CalendarDateFormatter {
  // you can override any of the methods defined in the parent class

  public monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return new DatePipe(locale).transform(date, 'EEE', locale);
  }

  public monthViewTitle({ date, locale }: DateFormatterParams): string {
    return new DatePipe(locale).transform(date, 'MMM y', locale);
  }

  public weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return new DatePipe(locale).transform(date, 'EEE', locale);
  }

  public dayViewHour({ date, locale }: DateFormatterParams): string {
    return new DatePipe(locale).transform(date, 'HH:mm', locale);
  }
}



export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  constructor(@Inject(LOCALE_ID) private locale: string) {
    super();
  }

  // you can override any of the methods defined in the parent class

  month(event: CalendarEvent): string {
    return `<b>${new DatePipe(this.locale).transform(
      event.start,
      'h:m a',
      this.locale
    )}</b> ${event.title}`;
  }

  week(event: CalendarEvent): string {
    return `<b>${new DatePipe(this.locale).transform(
      event.start,
      'h:m a',
      this.locale
    )}</b> ${event.title}`;
  }

  day(event: CalendarEvent): string {
    return `<b>${new DatePipe(this.locale).transform(
      event.start,
      'h:m a',
      this.locale
    )}</b> ${event.title}`;
  }
}

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};
@Component({
  selector: 'app-user-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    },
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    }
  ]
})

export class UserDashboardComponent implements OnInit {

  public eventId: string | number;
  public eventTitle: string;
  public eventColorPrimary: string;
  public eventColorSecondary: string;
  public eventStart: any;
  public eventEnd: any;
  public eventAllDay: boolean = false;

  public disconnectedSocket: boolean;
  public authToken: string;
  public userName: string;
  public userId: string;
  public userList: any[];
  public progressBar: boolean = false;
  public users: any[];
  public selectedUserId: string;
  public gentleReminder: boolean = true;

  constructor(
    private modal: NgbModal,
    private _router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private appService: AppServiceService,
    public socketService: SocketService,
  ) {

  }

  ngOnInit() {

    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get('userId');
    this.userName = Cookie.get('userName');
    this.verifyUserConfirmation();
    this.getOnlineUserList();
    this.getEvents();
    this.getUser();
    this.getUpdatesFromAdmin();
    setInterval(() => {
      this.meetingReminder();// function to send the reminder to the user
    }, 5000); //will check for every 5 seconds

  }


  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('viewModal') viewModal: TemplateRef<any>;
  @ViewChild('modalAlert') modalAlert: TemplateRef<any>;
  static = true;
  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    eventId: string | number,
    userId: string | number,
    adminName: string,
    adminId: string,
    start?: Date,
    end?: Date,
    title: string,
    color: { primary: string, secondary: string },
    actions?: EventAction[],
    allDay?: boolean,
    resizable?: {
      beforeStart?: boolean,
      afterEnd?: boolean,
    },
    draggable?: boolean,
    reminder?: boolean,
  }

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.toastr.warning(`You are not authorized to edit please contact Admin for editing`, 'Access Denied!');
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {

        this.toastr.warning(`You are not authorized to edit please contact Admin for editing or deleting`, 'Access Denied!');

      }
    }
  ];

  public deleteEvent = () => {
    console.log(this.modalData.eventId);
    this.progressBar = true;
    setTimeout(() => {
      this.appService.deleteThisEvent(this.modalData.eventId, event).subscribe(
        data => {
          console.log(data);
          this.progressBar = false;
          this.toastr.success('Event Deleted successfully', 'Success!');

        },
        (errorMessage) => {
          console.log("Some error occured");
          console.log(errorMessage.errorMessage);
          this.progressBar = false;
          this.toastr.error('Some error occured', 'Error');
          this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
        }
      )

      this.events = [];
      this.getEvents();

      try {

        let closeButtonForModal = document.getElementById("editModalCloseButton");
        console.log(closeButtonForModal);
        closeButtonForModal.click();
      } catch (error) {

      }
      try {
        let closeViewModalButton = document.getElementById("viewModalCloseButton");
        console.log(closeViewModalButton);
        closeViewModalButton.click();
      } catch (error) {

      }
    })



  }


  public getEvents = (userId = this.userId) => {
    this.events = [];
    console.log(userId);

    setTimeout(() => {

      this.appService.getUserEvents(userId).subscribe(
        (apiResponse) => {
          console.log(apiResponse);



          console.log(apiResponse["data"]);
          let eventData = apiResponse.data;
          console.log(eventData);
          if (apiResponse.status == 200) {

            this.toastr.success('Events Fetched Successfully', 'Success!');
            for (let data in eventData) {

              console.log(data);
              this.events = [
                ...this.events,
                {
                  eventId: eventData[data].eventId,
                  userId: eventData[data].userId,
                  adminName: eventData[data].adminName,
                  adminId: eventData[data].adminId,
                  start: new Date(eventData[data].start),
                  end: new Date(eventData[data].end),
                  title: eventData[data].title,
                  color: { primary: eventData[data].color.primary, secondary: eventData[data].color.secondary },
                  actions: this.actions,
                  allDay: eventData[data].allDay,
                  draggable: false,
                  resizable: {
                    beforeStart: false,
                    afterEnd: false
                  }
                }
              ];
            }
            this.refresh.next();
          } else {

            this.toastr.warning('No Events available')

          }

        },
        (errorMessage) => {

          console.log("Some error occured");
          console.log(errorMessage.errorMessage);

          this.toastr.error('Some error occured', 'Error');
          this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
        }
      )
    }, 2000);
  }

  public updateEvents = (userId = this.userId) => {
    this.events = [];
    console.log(userId);

    setTimeout(() => {

      this.appService.getUserEvents(userId).subscribe(
        (apiResponse) => {
          console.log(apiResponse);



          console.log(apiResponse["data"]);
          let eventData = apiResponse.data;
          console.log(eventData);
          if (apiResponse.status == 200) {

            // this.toastr.success('Events Fetched Successfully', 'Success!');
            for (let data in eventData) {

              console.log(data);
              this.events = [
                ...this.events,
                {
                  eventId: eventData[data].eventId,
                  userId: eventData[data].userId,
                  adminName: eventData[data].adminName,
                  adminId: eventData[data].adminId,
                  start: new Date(eventData[data].start),
                  end: new Date(eventData[data].end),
                  title: eventData[data].title,
                  color: { primary: eventData[data].color.primary, secondary: eventData[data].color.secondary },
                  actions: this.actions,
                  allDay: eventData[data].allDay,
                  draggable: false,
                  resizable: {
                    beforeStart: false,
                    afterEnd: false
                  }
                }
              ];
            }
            this.refresh.next();
          } else {

            // this.toastr.warning('No Events available')
            this.refresh.next();
          }

        },
        (errorMessage) => {

          console.log("Some error occured");
          console.log(errorMessage.errorMessage);
          this.refresh.next();
          this.toastr.error('Some error occured', 'Error');
          this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
        }
      )
    }, 2000);
  }

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [];

  activeDayIsOpen: boolean = true;

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    // this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  public clearModalValues = () => {
    this.eventTitle = ''
    this.eventColorPrimary = "#ff5959"
    this.eventColorSecondary = "#ff5959"
    this.eventAllDay = null
    this.eventStart = null
    this.eventEnd = null
  }

  public viewEvent = ({ event }: { event: CalendarEvent }): void => {


    this.modalData = {
      eventId: event.eventId,
      userId: event.userId,
      adminName: event.adminName,
      adminId: event.adminId,
      start: new Date(event.start),
      end: new Date(event.end),
      title: event.title,
      color: { primary: event.color.primary, secondary: event.color.secondary },
      actions: event.actions,
      allDay: event.allDay,
      resizable: {
        beforeStart: false,
        afterEnd: false,
      },
      draggable: false,
      reminder: event.reminder
    }

    this.modal.open(this.viewModal);

  }


  public saveEdit = () => {
    this.progressBar = true;
    if (!(this.modalData.title)) {
      this.progressBar = false;
      this.toastr.info("please enter the Title", "Info !");
    } else if (!(this.modalData.start || this.modalData.allDay)) {
      this.progressBar = false;
      this.toastr.info("please select all day event or the start date", "Info !");
    } else if (!(this.modalData.end || this.modalData.allDay)) {
      this.progressBar = false;
      this.toastr.info("please select all day event or the end date", "Info !");
    } else if (!(this.modalData.color.primary)) {
      this.progressBar = false;
      this.toastr.info("please select primary colour of your choice to indicate an event", "Info !");
    } else if (!(this.modalData.color.secondary)) {
      this.progressBar = false;
      this.toastr.info("please select secondary colour of your choice to indicate an event", "Info !");
    } else {
      setTimeout(() => {
        this.progressBar = false;
        this.appService.editTheEvent(this.modalData.eventId, this.modalData).subscribe(
          data => {
            console.log(data);

            this.toastr.success('Dismissed successfully', 'Success!');
            this.events = [];
            setTimeout(() => {
              this.getEvents();
            }
              , 2000)
          },
          (errorMessage) => {
            console.log("Some error occured");
            console.log(errorMessage.errorMessage);

            this.toastr.error('Some error occured', 'Error');
            this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
          }
        )

      }, 2000)

    }
  }

  public verifyUserConfirmation: any = () => {

    this.socketService.verifyUser()
      .subscribe((data) => {

        this.disconnectedSocket = false;

        this.socketService.setUser(this.authToken);

      });
  }

  public getOnlineUserList: any = () => {

    this.socketService.onlineUserList()
      .subscribe((userList) => {

        this.userList = [];

        for (let x in userList) {

          let temp = { 'userId': x, 'name': userList[x], 'unread': 0, 'viewing': false };

          this.userList.push(temp);

        }

        console.log(this.userList);

      }); // end online-user-list
  }


  public logout: any = () => {

    this.progressBar = true;
    setTimeout(() => {

      this.appService.logOut(this.userId)
        .subscribe((apiResponse) => {

          if (apiResponse.status === 200) {
            console.log("logout called")

            Cookie.delete('authtoken');

            Cookie.delete('receiverId');

            Cookie.delete('receiverName');

            localStorage.removeItem('userInfo');

            this.socketService.exitSocket()

            this._router.navigate(['/']);
          } else {
            this.progressBar = false;
            this.toastr.error(apiResponse.message)

          } // end condition

        }, (errorMessage) => {
          this.progressBar = false;
          this.toastr.error('some error occured')
          this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);

        });
    }, 2000)


  } // end logout



  public getUser = () => {
    this.appService.getExistingUserList().subscribe(Response => {
      console.log(Response);

      this.users = Response.data;
      console.log(this.users)

      this.toastr.success('Users retrieved successfully', 'Success!');
    },
      (errorMessage) => {
        console.log("Some error occured");
        console.log(errorMessage.errorMessage);

        this.toastr.error('Some error occured', 'Error');
        this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
      }
    )
  }

  public userSelected = (value: string) => {
    console.log(value);
    this.selectedUserId = value;
    this.userId = this.selectedUserId;
    setTimeout(() => {
      this.events = [];
      this.refresh.next();
      this.getEvents();
    }, 1500);

  }



  public setValueReminder = (eventData: any) => {
    this.modalData = eventData;
    if (this.modalData.reminder === true) {
      this.modalData['reminder'] = false;
      this.saveEdit();
      this.getEvents();
    } else {
      this.refresh.next();
    }
  }

  public meetingReminder(): any {
    let currentTime = new Date().getTime();

    for (let event of this.events) {
      // console.log(event);
      if (isSameDay(new Date(), event.start) && new Date(event.start).getTime() - currentTime <= 60000
        && new Date(event.start).getTime() > currentTime) {
        if (event.reminder && this.gentleReminder) {

          this.modalData = {
            eventId: event.eventId,
            userId: event.userId,
            adminName: event.adminName,
            adminId: event.adminId,
            start: new Date(event.start),
            end: new Date(event.end),
            title: event.title,
            color: { primary: event.color.primary, secondary: event.color.secondary },
            actions: event.actions,
            allDay: event.allDay,
            resizable: {
              beforeStart: false,
              afterEnd: false,
            },
            draggable: false,
            reminder: event.reminder
          }


          this.modal.open(this.modalAlert, { size: 'sm' });
          this.gentleReminder = false;
          break;
        }//end inner if

      }//end if
      else if (currentTime > new Date(event.start).getTime() &&
        currentTime - new Date(event.start).getTime() < 10000) {
        this.toastr.info(`Meeting ${event.title} Started!`, `Gentle Reminder`);
      }
    }

  }


  public getUpdatesFromAdmin = () => {

    this.socketService.getUpdatesFromAdmin(this.userId).subscribe((data) => {//getting message from admin.
      this.updateEvents();
      this.toastr.info("Update From Admin!", data.message);
    });
  }

}
