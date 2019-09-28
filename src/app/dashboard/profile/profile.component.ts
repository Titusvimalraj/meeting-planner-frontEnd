import { Component, OnInit } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppServiceService } from 'src/app/app-service.service';
import { SocketService } from 'src/app/socket.service';
import { BootstrapOptions } from '@angular/core/src/application_ref';
import { Location } from '@angular/common';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  public progressBar: boolean;
  public userName: string;
  public userId: string;
  public infoLoaded: boolean;
  public userType: string;
  public adminUser: boolean;
  public userInfo: {
    firstName: string,
    lastName: string,
    email: string,
    countryName: string,
    mobileNumber: number,
    userType: string
  }
  constructor(
    private modal: NgbModal,
    private _router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private appService: AppServiceService,
    public socketService: SocketService,
    private location: Location) { }

  ngOnInit() {
    this.userName = Cookie.get('userName');
    this.userId = Cookie.get('userId');
    this.userType = Cookie.get('userType');
    console.log(this.userType);
    this.getUserInfo();


    if (this.userType === 'Admin') {
      return this.adminUser = true;

    } else {
      return this.adminUser = false;
    }


  }

  public getUserInfo = () => {
    this.progressBar = true;
    setTimeout(() => {
      this.appService.getUserInfo(this.userId).subscribe(
        response => {
          console.log(response);
          this.toastr.success('got the userInfo', 'Success!');
          this.userInfo = {
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            countryName: response.data.countryName,
            mobileNumber: response.data.mobileNumber,
            userType: response.data.userType
          }
          this.infoLoaded = true;
        },
        error => {
          console.log("Some error occured");
          console.log(error.errorMessage);
          // alert('Some error occured');
          this.toastr.error('Some error occured', 'Error');
        })
    },2000);
  }

  public goBackToPreviousPage(): any {
    this.location.back();
  }



}
