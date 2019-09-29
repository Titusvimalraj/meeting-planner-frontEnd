import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppServiceService } from 'src/app/app-service.service';
import { GlobalConfig } from 'src/app/globalConfig';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public progressBar = false;
  emailModal: any;
  forgotPassModal: any;



  constructor(private _router: Router, private activatedRoute: ActivatedRoute, private toastr: ToastrService, private appService: AppServiceService) { }

  ngOnInit() {
  }

  hide = true;

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  passwordFormControl = new FormControl(null, [
    Validators.required
  ]);

  matcher = new MyErrorStateMatcher();

  private email: string;

  private password: string;



  public goToSignUp: any = () => {
    this.progressBar = true;
    setTimeout(() => {
      this._router.navigate([`/${GlobalConfig.apiVersion}/users/sign-up`]);
    }, 2000)
  } // end goToSignUp


  /**   * @author Titus Vimal Raj
   * @description will logs in the user to the System
   */

  public signinFunction: any = () => {
    this.progressBar = true;

    this.email = this.emailFormControl.value;

    this.password = this.passwordFormControl.value;

    setTimeout(() => {

      if (!this.email) {
        this.toastr.warning('enter email')
        this.progressBar = false;

      } else if (!this.password) {

        this.toastr.warning('enter password')
        this.progressBar = false;

      } else {

        let data = {
          email: this.email,
          password: this.password
        }

        this.appService.logIn(data)
          .subscribe((apiResponse) => {

            if (apiResponse.status === 200) {
              //console.log(apiResponse)

              Cookie.delete('authToken', '/api/v1/users');

              Cookie.delete('userId', '/api/v1/users');

              Cookie.delete('userName', '/api/v1/users');

              Cookie.delete('userType', '/api/v1/users');

              localStorage.removeItem('userInfo');

              Cookie.set('authToken', apiResponse.data.authToken);

              Cookie.set('userId', apiResponse.data.userDetails.userId);

              Cookie.set('userName', apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName);

              Cookie.set('userType', apiResponse.data.userDetails.userType);

              this.appService.setToLocalStorage(apiResponse.data.userDetails)

              this.toastr.success(`${apiResponse.message}`, 'Success user verified!');
              //console.log(apiResponse.data.userDetails.userType);
              //console.log(typeof (apiResponse.data.userDetails.userType));
              setTimeout(() => {

                if (apiResponse.data.userDetails.userType === "Admin") {
                  //console.log("Admin navigation route")
                  //console.log(Cookie.get('authToken'))
                  this.progressBar = false;
                  this._router.navigate([`${GlobalConfig.apiVersion}/planner`, Cookie.get('userId'), 'admin']);
                }
                else {
                  //console.log("User navigation route")
                  this.progressBar = false;
                  this._router.navigate([`${GlobalConfig.apiVersion}/planner`, Cookie.get('userId'), 'user']);
                }

              }, 2000)

            } else {

              this.toastr.error(apiResponse.message)
              this.progressBar = false;

            }

          }, (err) => {
            this.toastr.error('some error occured')
            this.progressBar = false;
          });

      } // end condition
    }, 2000)
  } // end signinFunction


  /**
   * @description validates user email
   * @author Titus Vimal Raj
   */
  public validateUser = () => {
    this.progressBar = true;
    setTimeout(() => {
      if (this.appService.validateEmail(this.emailModal)) {
        this.toastr.error("Not a valid email", "Email !");
        this.progressBar = false;
      }
      else {
        this.appService.checkUserExist(this.emailModal).subscribe(
          (apiResponse) => {
            //console.log(apiResponse);
            if (apiResponse.status === 201) {
              this.toastr.info(`${apiResponse.message}`, "Email !");
              this.progressBar = false;
            }
            if (apiResponse.status === 200) {
              //console.log('running forgetPassword')
              let x = document.getElementById('forgotPasswordModal');
              x.click();
              this.sendEmail();
              this.progressBar = false;
            }
          },
          (errorMessage) => {
            this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
          })

      }
    }, 2000)
  }//end of validate user

  /**
   * @description will send request to send an email
   * @author Titus Vimal Raj
   */
  public sendEmail = () => {
    //console.log('inside Send Email')
    this.appService.sendEmail(this.emailModal).subscribe(
      (apiResponse) => {
        if (this.appService.checkResStatus(apiResponse)) {
          this._router.navigate([`/${GlobalConfig.apiVersion}/users/resetlink`, this.emailModal]);
          this.emailModal = "";
        }
      },
      (errorMessage) => {
        this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
      })
  }
}
