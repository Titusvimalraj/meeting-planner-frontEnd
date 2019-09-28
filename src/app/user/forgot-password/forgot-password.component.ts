import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppServiceService } from 'src/app/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalConfig } from 'src/app/globalConfig';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  public password: string;
  public confirmPassword: string;

  constructor(private _router: Router, private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private appService: AppServiceService) { }

  ngOnInit() {
  }

  /**
   * @description request the server to set new password
   * @author Titus Vimal Raj
   */
  public resetPassword = () => {
    let email = this._route.snapshot.queryParamMap.get('email');
    let data = {
      email: email,
      password: this.password,
    }
    if (this.password !== this.confirmPassword) {
      this._toastr.info("Passwords not matching", 'Password !');
    }
    else if (this.appService.validatePassword(this.password)) {
      this._toastr.info("minimum 5 characters password should contain atleast one Uppercase and one Lowercase letters,one number", "Password !");
    }
    else {
      this.appService.resetPassword(data).subscribe((apiResponse) => {
        if (this.appService.checkResStatus(apiResponse)) {
          this._toastr.success(apiResponse.message, "Success !");
          setTimeout(() => {
            this._router.navigate([`/${GlobalConfig.apiVersion}/users/login`]);
          }, 1000)
        }
      },
        (errorMessage) => {
          this.appService.navigateToErrorPage(`/${GlobalConfig.apiVersion}/error`, errorMessage);
        })
    }
  }//end of rest password
}
