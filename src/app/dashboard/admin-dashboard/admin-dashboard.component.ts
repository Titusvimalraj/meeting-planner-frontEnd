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
  addHours,
  isBefore
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
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
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
export class AdminDashboardComponent implements OnInit {

  public eventId: string | number;
  public eventTitle: string;
  public eventColorPrimary: string;
  public eventColorSecondary: string;
  public eventStart: any;
  public eventEnd: any;
  public eventAllDay: boolean = false;
  public userAdminAccess: boolean;
  public disconnectedSocket: boolean;
  public authToken: string;
  public userName: string;
  public userId: string;
  public userList: any[];
  public progressBar: boolean;
  public users: any[];
  public selectedUserId: string;
  public adminName: string;
  public adminId: string;
  public gentleReminder: boolean = true;
  public userSocketId: string;

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

    this.userAccess();
    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get('userId');
    this.userName = Cookie.get('userName');
    this.adminName = Cookie.get('userName');
    this.adminId = Cookie.get('userId');
    this.progressBar = false;
    this.events = [];
    this.verifyUserConfirmation();
    this.getEvents();
    this.getUser();
    this.getSocketUserId();
    this.getOnlineUserList();
    //console.log(this.events);
    // this.getUpdatesFromOtherAdmin();

    setInterval(() => {
      this.meetingReminder();// function to send the reminder to the user
      // this.refresh.next();
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
    reminder: boolean;
  }

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        //console.log(event);
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
        this.modal.open(this.modalContent);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        //console.log(event);
        this.appService.deleteThisEvent(event.eventId, event).subscribe(
          data => {
            //console.log(data);

            this.toastr.success('Event Deleted successfully', 'Success!');
            if (this.userId !== this.adminId) {
              let indexValue;
              for (let x in this.users) {
                if (this.userId == this.users[x].userId) {
                  indexValue = x;
                  break;
                }
              }
              let emailData = {
                email: this.users[indexValue].email,
                name: this.users[indexValue].fullName,
                subject: `${event.adminName}-Admin has cancelled your meeting: ${event.title}`,
                html: `<h3> Meeting cancelled </h3>
                    <br> Hi , ${this.users[indexValue].fullName} .
                    <br> ${event.adminName}-Admin has cancelled your meeting: ${event.title}.
                    `
              }
              this.socketService.sendEmail(emailData).subscribe(
                data => {
                  //console.log(data);
                  this.toastr.success(`Sent Email successfully to ${data.name}`, 'Success!');
                },
                error => {
                  //console.log(error);
                  this.toastr.error('Some error occured', 'Error');
                });

              let dataForNotify = {
                message: `Hi, ${this.adminName}-Admin has cancelled the meeting - ${event.title}. Please Check your Calendar/Email`,
                userId: this.userId
              }


              this.notifyUpdatesToUser(dataForNotify);
            }

          },
          (errorMessage) => {
            //console.log("Some error occured");
            //console.log(errorMessage.errorMessage);

            this.toastr.error('Some error occured', 'Error');
            this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
          }
        )
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.refresh.next();
      }
    }
  ];

  public deleteEvent = () => {
    //console.log(this.modalData.eventId);
    this.progressBar = true;
    setTimeout(() => {
      this.appService.deleteThisEvent(this.modalData.eventId, event).subscribe(
        data => {
          //console.log(data);
          this.progressBar = false;
          this.toastr.success('Event Deleted successfully', 'Success!');
          if (this.userId !== this.adminId) {
            let indexValue;
            for (let x in this.users) {
              //console.log(`delete event users index ${x}`);
              if (this.userId == this.users[x].userId) {
                indexValue = x;
                break;
              }
            }
            setTimeout(() => {
              let emailData = {
                email: this.users[indexValue].email,
                name: this.users[indexValue].fullName,
                subject: `${this.adminName}-Admin has cancelled your meeting: ${this.modalData.title}`,
                html: `<h3> Meeting cancelled </h3>
                    <br> Hi , ${this.users[indexValue].fullName} .
                    <br> ${this.adminName}-Admin has cancelled your meeting: ${this.modalData.title}.
                    `
              }
              this.socketService.sendEmail(emailData).subscribe(
                data => {
                  //console.log(data);
                  this.toastr.success(`Sent Email successfully to ${data.name}`, 'Success!');
                },
                (errorMessage) => {
                  //console.log(errorMessage);
                  this.toastr.error('Some error occured', 'Error');
                  this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
                });
            }, 2000);

            let dataForNotify = {
              message: `Hi, ${this.adminName}-Admin has cancelled the meeting - ${this.modalData.title}. Please Check your Calendar/Email`,
              userId: this.userId
            }


            this.notifyUpdatesToUser(dataForNotify);
          }

        },
        (errorMessage) => {
          //console.log("Some error occured");
          //console.log(errorMessage.errorMessage);
          this.progressBar = false;
          this.toastr.error('Some error occured', 'Error');
          this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);

        }
      )

      this.events = [];
      this.getEvents();

      try {

        let closeButtonForModal = document.getElementById("editModalCloseButton");
        //console.log(closeButtonForModal);
        closeButtonForModal.click();
      } catch (error) {

      }
      try {
        let closeViewModalButton = document.getElementById("viewModalCloseButton");
        //console.log(closeViewModalButton);
        closeViewModalButton.click();
      } catch (error) {

      }
    })



  }

  public userAccess = () => {
    //console.log(Cookie.get('userType'));
    let userTypeValue = Cookie.get('userType');
    if (userTypeValue === 'Admin') {
      //console.log("Admin user hence access given")
      this.userAdminAccess = true;
      return this.userAdminAccess;
    } else {
      this.userAdminAccess = false;
      return this.userAdminAccess;
    }
  }

  public getEvents = (userId = this.userId) => {
    this.events = [];
    //console.log(userId);
    setTimeout(() => {


      this.appService.getUserEvents(userId).subscribe(

        (apiResponse) => {

          //console.log(apiResponse);



          //console.log(apiResponse["data"]);
          let eventData = apiResponse.data;
          //console.log(eventData);
          if (apiResponse.status == 200) {
            this.toastr.success('Events Fetched Successfully', 'Success!');
            for (let data in eventData) {

              //console.log(data);
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
                  },
                  reminder: eventData[data].reminder
                }
              ];
            }
            this.refresh.next();
          } else {

            //console.log( `progress bar is ${this.progressBar}`)
            this.toastr.warning('No Events available')

          }

        },
        (errorMessage) => {

          //console.log("Some error occured");
          //console.log(errorMessage.message);
          // alert('Some error occured');
          this.toastr.error('Some error occured', 'Error');
          this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
        }
      );
    }, 2000);
    //console.log( `Outside progress bar is ${this.progressBar}`)
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

  // addEvent(): void {
  //   this.events = [
  //     ...this.events,
  //     {
  //       title: 'New event',
  //       start: startOfDay(new Date()),
  //       end: endOfDay(new Date()),
  //       color: colors.red,
  //       draggable: true,
  //       resizable: {
  //         beforeStart: true,
  //         afterEnd: true
  //       }
  //     }
  //   ];
  // }


  public addNewEvent: any = () => {
    this.progressBar = true;
    setTimeout(() => {
      if (!(this.eventTitle)) {
        this.progressBar = false;
        this.toastr.info("please enter the Title", "Info !");
      } else if (!(this.eventStart || this.eventAllDay)) {
        this.progressBar = false;
        this.toastr.info("please select all day event or the start date", "Info !");
      } else if (!(this.eventEnd || this.eventAllDay)) {
        this.progressBar = false;
        this.toastr.info("please select all day event or the end date", "Info !");
      } else if (!(this.eventColorPrimary)) {
        this.progressBar = false;
        this.toastr.info("please select a colour of your choice to indicate an event", "Info !");
      } else if (!(this.eventColorSecondary)) {
        this.progressBar = false;
        this.toastr.info("please select a colour of your choice to indicate an event", "Info !");
      }
      else {
        this.progressBar = false;
        let eventObj = {
          userId: this.userId,
          adminName: this.adminName,
          adminId: this.adminId,
          start: new Date(this.eventStart),
          end: new Date(this.eventEnd),
          title: this.eventTitle,
          color: { primary: this.eventColorPrimary, secondary: this.eventColorSecondary },
          actions: this.actions,
          allDay: this.eventAllDay,
          resizable: {
            beforeStart: false,
            afterEnd: false
          },
          draggable: false,
          reminder: true
        }

        //console.log(eventObj);
        this.socketService.addNewEventToDatabase(eventObj);
        this.socketService.getEventId().subscribe(data => {
          //console.log(data);
          // this.toastr.success('got the EventId', 'Success!');
          this.eventId = data;
          // //console.log(this.eventId);
        },
          (errorMessage) => {
            //console.log("Some error occured");
            //console.log(errorMessage.errorMessage);
            // alert('Some error occured');
            this.toastr.error('Some error occured', 'Error');
            this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
          });

        setTimeout(() => {
          this.events = [
            ...this.events,
            {
              eventId: this.eventId,
              userId: eventObj.userId,
              adminName: eventObj.adminName,
              adminId: eventObj.adminId,
              start: new Date(eventObj.start),
              end: new Date(eventObj.end),
              title: eventObj.title,
              color: { primary: eventObj.color.primary, secondary: eventObj.color.secondary },
              actions: eventObj.actions,
              allDay: eventObj.allDay,
              draggable: false,
              resizable: {
                beforeStart: false,
                afterEnd: false
              },
              reminder: true
            }
          ];

          this.refresh.next();

          try {
            let x = document.getElementById("modalCloseButton");
            //console.log(x);
            x.click();
          } catch (error) {

          }


          let newEventObj = {
            eventId: this.eventId,
            userId: eventObj.userId,
            adminName: eventObj.adminName,
            adminId: eventObj.adminId,
            start: new Date(eventObj.start),
            end: new Date(eventObj.end),
            title: eventObj.title,
            color: { primary: eventObj.color.primary, secondary: eventObj.color.secondary },
            actions: eventObj.actions,
            allDay: eventObj.allDay,
            draggable: false,
            resizable: {
              beforeStart: false,
              afterEnd: false
            },
            reminder: true
          }
          this.toastr.success(`Meeting: ${newEventObj.title} was added successfully`, 'Success!');

          if (this.userId !== this.adminId) {
            //console.log(`new event object is ${newEventObj}`)
            let indexValue;
            for (let x in this.users) {
              //console.log(`add event users index ${x}`);
              if (this.userId == this.users[x].userId) {
                indexValue = x;
                break;
              }
            }
            setTimeout(() => {
              let emailData = {
                email: this.users[indexValue].email,
                name: this.users[indexValue].fullName,
                subject: `${this.adminName}-Admin has added your meeting: ${newEventObj.title}`,
                html: `<h3> Admin added a new meeting </h3>
                        <br> Hi , ${this.users[indexValue].fullName} .
                        <br> ${this.adminName}-Admin has added your meeting: ${newEventObj.title}.
                        `
              }
              this.socketService.sendEmail(emailData).subscribe(
                data => {
                  //console.log(data);
                  this.toastr.success(`Sent Email successfully to ${data.name}`, 'Success!');
                },
                error => {
                  //console.log(error);
                  this.toastr.error('Some error occured', 'Error');
                });
            }, 2000);
            let dataForNotify = {
              message: `Hi, ${this.adminName}-Admin has added the meeting - ${newEventObj.title}. Please Check your Calendar/Email`,
              userId: this.userId
            }


            this.notifyUpdatesToUser(dataForNotify);
          }
        }, 500)

      }
    }, 1000)
    // //console.log(this.events);
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
  //view event modal
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
            //console.log(data);

            this.toastr.success('Event edited successfully', 'Success!');
            this.events = [];
            this.refresh.next();
            setTimeout(() => {
              this.getEvents();
            }, 2000);

            if (this.userId !== this.adminId) {
              let indexValue;
              for (let x in this.users) {
                //console.log(`save edit users index ${x}`);
                if (this.userId == this.users[x].userId) {
                  indexValue = x;
                  break;
                }
              }
              setTimeout(() => {
                let emailData = {
                  email: this.users[indexValue].email,
                  name: this.users[indexValue].fullName,
                  subject: `${this.adminName}-Admin has edited your meeting: ${this.modalData.title}`,
                  html: `<h3> Meeting Edited </h3>
                        <br> Hi , ${this.users[indexValue].fullName} .
                        <br> ${this.adminName}-Admin has edited your meeting: ${this.modalData.title}.
                        `
                }
                this.socketService.sendEmail(emailData).subscribe(
                  data => {
                    //console.log(data);
                    this.toastr.success(`Sent Email successfully to ${data.name}`, 'Success!');
                  },
                  error => {
                    //console.log(error);
                    this.toastr.error('Some error occured', 'Error');
                  });
              }, 2000);

              let dataForNotify = {
                message: `Hi, ${this.adminName}-Admin has edited the meeting - ${this.modalData.title}. Please Check your Calendar/Email`,
                userId: this.userId
              }


              this.notifyUpdatesToUser(dataForNotify);
            }

          },
          (errorMessage) => {
            //console.log("Some error occured");
            //console.log(errorMessage);
            this.toastr.error('Some error occured', 'Error');
            this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
          }
        )

      }, 1000)

      try {
        let closeButtonForModal = document.getElementById("editModalCloseButton");
        //console.log(closeButtonForModal);
        closeButtonForModal.click();

      } catch (error) {

      }

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
        //console.log(`online user list is this`);
        //console.log(userList);
        this.userList = [];

        this.userList = userList;


      });
    // end online-user-list

  }


  public logout: any = () => {

    this.progressBar = true;
    setTimeout(() => {

      this.appService.logOut(this.userId)
        .subscribe((apiResponse) => {

          if (apiResponse.status === 200) {
            //console.log("logout called")

            Cookie.delete('authtoken');

            Cookie.delete('userId');

            Cookie.delete('userName');

            Cookie.delete('userType');

            localStorage.removeItem('userInfo');

            this.socketService.exitSocket()

            this._router.navigate(['/']);

          } else {
            //if already logged out
            this.progressBar = false;
            this.toastr.error(apiResponse.message)
            this._router.navigate(['/']);

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
      //console.log(Response);

      this.users = Response.data;
      //console.log(this.users)
      setTimeout(() => {
        let indexValue;
        //console.log(this.users);
        //console.log(typeof this.users);
        for (let x in this.users) {
          //console.log(`save edit users index ${x}`);
          if (this.userId == this.users[x].userId) {
            indexValue = x;
            break;
          }
        }
        //console.log(`index value is ${indexValue}`);
        try {
          this.users.splice(indexValue, 1);
        } catch (error) {

        }

        //console.log(this.users);
      }, 500);


      this.toastr.success('Users retrieved successfully', 'Success!');
    },
      (errorMessage) => {
        //console.log("Some error occured");
        //console.log(errorMessage.errorMessage);

        this.toastr.error('Some error occured', 'Error');
        this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
      }
    )
  }

  public userSelected = (value: string) => {
    //console.log(value);
    this.selectedUserId = value;
    this.userId = this.selectedUserId;
    setTimeout(() => {
      this.events = [];
      this.refresh.next();
      this.getEvents();
    }, 1500);

  }

  public getSocketUserId = () => {

    this.socketService.getSocketId().subscribe(
      (data) => {
        //console.log(`socket id is`);
        //console.log(data);
      }
    )
  }

  public getOnlineUserSocketId = (userId = this.userId) => {

    //console.log(this.userList);

    for (let x in this.userList) {
      //console.log(x);
      let userIdInList = this.userList[x].userId;
      //console.log(userIdInList);
      if (userIdInList === userId) {
        this.userSocketId = this.userList[x].socketId;
        break;
      }
    }
    //console.log(`The socket Id of user is ${this.userSocketId}`);
  }


  public meetingReminder(): any {
    let currentTime = new Date().getTime();

    for (let event of this.events) {

      if (isSameDay(new Date(), new Date(event.start)) && new Date(event.start).getTime() - currentTime <= 60000
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

  }//end of meetingReminder function


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



  public sendReminderOnEventsSetByAdmin = () => {
    this.adminName = Cookie.get('userName');
    this.adminId = Cookie.get('userId');
    //console.log(this.adminId)
    this.appService.getEventsAssociatedWithAdmin(this.adminId).subscribe(
      (Response) => {
        if (Response.status == 200) {
          this.toastr.success(`user events set by Admin user ${this.adminName} fetched Successfully`, 'Success!');
          //console.log(Response);
          //console.log(this.users);
          let AdminSetEvents = Response.data;
          let eventsBeforeTodayList = [];
          for (let adminEvent of AdminSetEvents) {
            let currentTime = new Date().getTime();
            if (isSameDay(new Date(), new Date(adminEvent.start)) && new Date(adminEvent.start).getTime() > currentTime) {
              eventsBeforeTodayList.push(adminEvent);
            } else if (isBefore(new Date(), new Date(adminEvent.start))) {
              eventsBeforeTodayList.push(adminEvent);
            }
          }

          for (let eventbeforeNow of eventsBeforeTodayList) {
            for (let x in this.users) {
              if (this.users[x].userId === eventbeforeNow.userId) {
                let emailData = {
                  email: this.users[x].email,
                  name: this.users[x].fullName,
                  subject: `${eventbeforeNow.adminName}-Admin has sent reminder for your meeting: ${eventbeforeNow.title}`,
                  html: `<h3> Meeting Reminder </h3>
                          <br> Hi , ${this.users[x].fullName} .
                          <br> ${eventbeforeNow.adminName}-Admin has sent reminder for your meeting: ${eventbeforeNow.title}.
                        `
                }
                this.socketService.sendReminderEmail(emailData).subscribe(
                  data => {
                    //console.log(data);
                    this.toastr.success(`Sent Email successfully to ${data.name}`, 'Success!');
                  },
                  error => {
                    //console.log(error);
                    this.toastr.error('Some error occured', 'Error');
                  });

              }
            }
          }

        } else {

          this.toastr.warning(`No users associated with any of the events set by Admin user ${this.adminName}`);

        }
      },
      (errorMessage) => {
        //console.log(errorMessage);
        this.toastr.error('some error occured')
        this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
      }
    )
  }


  public notifyUpdatesToUser: any = (data) => {
    //data will be object with message and userId(recieverId)
    this.socketService.notifyUpdates(data);

  }//end notifyUpdatesToUser

  public updateEvents = (userId = this.userId) => {
    this.events = [];
    //console.log(userId);

    setTimeout(() => {

      this.appService.getUserEvents(userId).subscribe(
        (apiResponse) => {
          //console.log(apiResponse);



          //console.log(apiResponse["data"]);
          let eventData = apiResponse.data;
          //console.log(eventData);
          if (apiResponse.status == 200) {

            // this.toastr.success('Events Fetched Successfully', 'Success!');
            for (let data in eventData) {

              //console.log(data);
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

          } else {

            // this.toastr.warning('No Events available')

          }

        },
        (errorMessage) => {

          //console.log("Some error occured");
          //console.log(errorMessage.errorMessage);

          this.toastr.error('Some error occured', 'Error');
          this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
        }
      );
    }, 1000);
    this.refresh.next();
  }
  public getUpdatesFromOtherAdmin = () => {

    this.socketService.getUpdatesFromAdmin(this.userId).subscribe((data) => {
      //getting message from other admin.
      this.updateEvents();
      this.toastr.info("Update!", data.message);
    });
  }

}