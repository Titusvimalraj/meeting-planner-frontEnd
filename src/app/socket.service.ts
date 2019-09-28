import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { GlobalConfig } from './globalConfig';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;
  private url = `${GlobalConfig.serverUrl}`;

  constructor(public http: HttpClient) {
    // connection is being created.
    // that handshake
    this.socket = io(this.url);

  }
  // events to be listened 

  public verifyUser = () => {

    return Observable.create((observer) => {

      this.socket.on('verifyUser', (data) => {

        observer.next(data);

      }); // end Socket

    }); // end Observable

  } // end verifyUser

  public onlineUserList = () => {

    return Observable.create((observer) => {

      this.socket.on("online-user-list", (userList) => {

        observer.next(userList);

      }); // end Socket

    }); // end Observable

  } // end onlineUserList


  public disconnectedSocket = () => {

    return Observable.create((observer) => {

      this.socket.on("disconnect", () => {

        observer.next();

      }); // end Socket

    }); // end Observable



  } // end disconnectSocket

  // end events to be listened

  // events to be emitted

  public setUser = (authToken) => {

    this.socket.emit("set-user", authToken);

  } // end setUser

  // events to be emitted



  addNewEventToDatabase = (eventObj: object) => {
    console.log(eventObj);
    this.socket.emit('event-add', eventObj);
  }

  public exitSocket = () => {


    this.socket.disconnect();


  }// end Socket



  private handleError(err: HttpErrorResponse) {

    let errorMessage = '';

    if (err.error instanceof Error) {

      errorMessage = `An error occurred: ${err.error.message}`;

    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;

    } // end condition *if

    console.error(errorMessage);

    return Observable.throw(errorMessage);

  }  // END handleError


  public getEventId = () => {

    return Observable.create((observer) => {
      this.socket.on('eventId', (data) => {
        observer.next(data);
      }); // end Socket
    });
  }

  public getSocketId = () => {
    this.socket.emit('socket-id', Cookie.get('userId'));
    return Observable.create((observer) => {
      this.socket.on('socket-userId', (data) => {
        observer.next(data);
      }); // end Socket
    });
  }

  public sendReminderEmail = (emailData) => {

    this.socket.emit('socket-reminder-email', emailData);
    return Observable.create((observer) => {
      this.socket.on('socket-reminder-email-sent', (data) => {
        observer.next(data);
      }); // end Socket
    });
  }

  public sendEmail = (emailData) => {

    this.socket.emit('socket-send-email', emailData);
    return Observable.create((observer) => {
      this.socket.on('socket-email-sent', (data) => {
        observer.next(data);
      }); // end Socket
    });
  }

  public getUpdatesFromAdmin = (userId) => {
    return Observable.create((observer) => {
      this.socket.on(userId, (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable
  } // end getUpdatesFromAdmin

  public notifyUpdates = (data) => {
    this.socket.emit('notify-updates', data);
  }

}
