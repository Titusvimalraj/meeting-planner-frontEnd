import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { GlobalConfig } from './globalConfig';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {

  private usersBaseUrl = `${GlobalConfig.serverUrl}/${GlobalConfig.apiVersion}/users`;
  private clientBaseUrl = `${GlobalConfig.clientUrl}/${GlobalConfig.apiVersion}/users`;
  private eventsBaseUrl = `${GlobalConfig.serverUrl}/${GlobalConfig.apiVersion}/events`;


  constructor(private _http: HttpClient, private _router: Router, private activatedRoute: ActivatedRoute, private toastr: ToastrService) { }


  /**
   * @author Titus Vimal Raj
   * @description calls the backend function for sign up
   * @param {Object} userData
   * @returns {Object} response
   */
  public signUp = (userData: any): Observable<any> => {
    return this._http.post(`${this.usersBaseUrl}/signup`, userData).catch(this.handleError);
  }

  /**
   * @author Titus Vimal Raj
   * Temporary user information storage
   */
  public setToLocalStorage = (data: any) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
  }// end of setLocalStorage 

  /**
   * @author Titus Vimal Raj
   */
  public getFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }//end of getFromLocalStorage


  /**
  * @author Titus Vimal Raj
  * @description calls the backend function for logging in
  * @param {Object} userData
  * @returns {Object} response
  */
  public logIn = (loginData: { email: string; password: string; }): Observable<any> => {
    let params = new HttpParams()
      .set('email', loginData.email)
      .set('password', loginData.password)

    return this._http.post(`${this.usersBaseUrl}/login`, params).catch(this.handleError);
  }

  /**
   * @description make a request to server to reset the password
   * @author Titus Vimal Raj
   * @returns {object} apiResponse
   */
  public resetPassword = (data: { email: string; password: string; }): Observable<any> => {
    const params = new HttpParams()
      .set('email', data.email)
      .set('password', data.password)
    return this._http.post(`${this.usersBaseUrl}/reset`, params).catch(this.handleError);
  }//end of reset password

  /**
   * @author Titus Vimal Raj
   * @param email
   */
  public checkUserExist = (email: any): Observable<any> => {
    return this._http.get(`${this.usersBaseUrl}/reset?email=${email}`).catch(this.handleError);
  }// end of check user list

  /**
   * @description requests server to send email
   * @author Titus Vimal Raj
   * @param {any} data
   * @returns {Object} result
   */
  public sendEmail = (email: any): Observable<any> => {
    const params = new HttpParams()
      .set("email", email)
      .set("clientUrl", this.clientBaseUrl);
    return this._http.post(`${this.usersBaseUrl}/sendemail`, params).catch(this.handleError);
  }

  /** 
  * This will delete the temporary data also remove authToken from server
  * @author Titus Vimal Raj
  * @param userId
 */
  public logOut = (userId: string): Observable<any> => {
    let params = new HttpParams()
      .set('userId', userId)
    return this._http.post(`${this.usersBaseUrl}/logout`, params);
  }//end of log out


  /**
   * @author Titus Vimal Raj
   * @description this is to handle http error repsonse
   * @param err 
   */
  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';

    if (err.error instanceof Error) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}: (${err.error.message})`;
    } // end condition *if
    return Observable.throw(errorMessage);

  }  // END handleError


  checkResStatus = (apiResponse: any): boolean => {
    let flag = true;
    if (apiResponse.status === 200) {
      flag = true;
    }
    else if (apiResponse.status === 201) {
      flag = false;
      this.toastr.info(`${apiResponse.message}`, "Info !");
    }
    else if (apiResponse.status === 202) {
      flag = false;
      this.toastr.error(`${apiResponse.message}`, "Error !");
    }
    else {
      flag = false;
    }
    return flag;
  }//end of check response status

  navigateToErrorPage = (url: string, param: string): void => {
    this._router.navigate([url], { queryParams: { errorMessage: param } });
  }


  /**
 * @description This is to validate email pattern
 * @author Titus Vimal Raj
 * @param {String} email
 * @returns boolean isMatch
 */
  validateEmail = (email: string) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return false;
    } else {
      return true;
    }
  }// end of Email

  /**
   * @description Minimum 5 characters which contain only characters,numeric digits and should contain uppercase, lowercase letters.
   * @author Titus Vimal Raj
   * @param {String} password 
   * @returns boolean is criteria matched or not
   */
  validatePassword = (password: string) => {
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$/.test(password)) {
      return false;
    } else {
      return true;
    }
  }//end of Password



  /**
  * @description sends request to edit an event
  * @author Titus Vimal Raj
  * @returns {Response}
  * @param {string|number} eventId
  * @param {any} eventdata
  */

  public editTheEvent = (eventId: string | number, eventdata): Observable<any> => {
    let myResponse = this._http.put(`${this.eventsBaseUrl}/${eventId}/edit?authToken=${Cookie.get('authToken')}`, eventdata).catch(this.handleError);
    return myResponse;
  }

  /**
  * @description sends request to delete an event
  * @author Titus Vimal Raj
  * @returns {Response}
  * @param {string} eventId
  * @param {any} eventdata
  */

  public deleteThisEvent = (eventId: string | number, eventData): Observable<any> => {

    let myResponse = this._http.post(`${this.eventsBaseUrl}/${eventId}/delete?authToken=${Cookie.get('authToken')}`, eventData).catch(this.handleError);
    return myResponse;

  }

  /**
 * @description sends request to add the sub item to item
 * @author Titus Vimal Raj
 * @returns {Response}
 * @param {string} userId
 */

  public getUserEvents = (userId: string): Observable<any> => {
    //console.log(userId);
    let myResponse = this._http.get(`${this.eventsBaseUrl}/${userId}/all?authToken=${Cookie.get('authToken')}`).catch(this.handleError);
    return myResponse;
  }

  /**
* @description sends request to add the sub item to item
* @author Titus Vimal Raj
* @returns {Response}
* @param {string} userId
*/

  public getUserInfo = (userId: string): Observable<any> => {
    //console.log(userId);
    let myResponse = this._http.get(`${this.usersBaseUrl}/${userId}/info?authToken=${Cookie.get('authToken')}`).catch(this.handleError);
    return myResponse;
  }

  /**
 * @description sends request to add the sub item to item
 * @author Titus Vimal Raj
 * @returns {Response}
 */

  public getExistingUserList = (): Observable<any> => {
    let myResponse = this._http.get(`${this.usersBaseUrl}/info/allUsers?authToken=${Cookie.get('authToken')}`).catch(this.handleError);
    return myResponse;
  }

  /**
* @description sends request to add the sub item to item
* @author Titus Vimal Raj
* @returns {Response}
* @param {string} adminId
*/

  public getEventsAssociatedWithAdmin = (adminId: string): Observable<any> => {
    let myResponse = this._http.get(`${this.eventsBaseUrl}/${adminId}/info/eventsAssociated?authToken=${Cookie.get('authToken')}`).catch(this.handleError);
    return myResponse;
  }
}
