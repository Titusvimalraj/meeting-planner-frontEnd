import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppServiceService } from 'src/app/app-service.service';
import { SocketService } from 'src/app/socket.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { GlobalConfig } from 'src/app/globalConfig';
import { Location } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './my-navbar.component.html',
  styleUrls: ['./my-navbar.component.css']
})
export class MyNavbarComponent implements OnInit {
  public progressBar: boolean = false;
  public userId: string;
  public userType: string;
  public usersList = [];
  public userAdminAccess: boolean;
  @Input()
  userName: string;
  firstChar: string;

  constructor(
    private modal: NgbModal,
    private _router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private appService: AppServiceService,
    public socketService: SocketService,
    public location: Location
  ) {

  }
  ngOnInit() {
    this.userAccess();
    this.firstChar = this.userName[0];
    this.userId = Cookie.get('userId');
    this.userType = Cookie.get('userType');
  }

  public logout: any = () => {

    this.progressBar = true;
    setTimeout(() => {

      this.appService.logOut(this.userId)
        .subscribe((apiResponse) => {
          this.progressBar = false;
          if (apiResponse.status === 200) {
            console.log("logout called")



            Cookie.delete('authToken', '/api/v1/planner/');

            Cookie.delete('userId', '/api/v1/planner/');

            Cookie.delete('userName', '/api/v1/planner/');

            Cookie.delete('userType', '/api/v1/planner/');




            Cookie.delete('authToken', '/api/v1/users');

            Cookie.delete('userId', '/api/v1/users');

            Cookie.delete('userName', '/api/v1/users');

            Cookie.delete('userType', '/api/v1/users');

            localStorage.removeItem('userInfo');

            this.socketService.exitSocket();

            this._router.navigate(['/']);
          } else {
            this.progressBar = false;
            this.toastr.error(apiResponse.message)

          } // end condition

        }, (err) => {
          this.progressBar = false;
          this.toastr.error('some error occured')


        });
    }, 2000)


  } // end logout

  public navigateToProfile = () => {
    this.progressBar = true;
    setTimeout(() => {
      this.progressBar = false;
      if (this._router.url === `/api/v1/planner/${Cookie.get('userId')}/profile`) {
        document.location.reload();
      } else {
        this._router.navigate([`${GlobalConfig.apiVersion}/planner`, Cookie.get('userId'), 'profile']);
      }
    }, 1500)

  }

  public navigateToHomePage = () => {
    this.progressBar = true;
    setTimeout(() => {
      this.progressBar = false;
      if (this.userType === "Admin") {
        console.log("Admin navigation route")
        console.log(Cookie.get('authToken'))
        this.progressBar = false;
        console.log(this._router.url);
        console.log(typeof this._router.url)
        if (this._router.url === `/api/v1/planner/${Cookie.get('userId')}/admin`) {
          document.location.reload();
        } else {
          this._router.navigate([`${GlobalConfig.apiVersion}/planner`, Cookie.get('userId'), 'admin']);
        }

      }
      else {
        console.log("User navigation route")
        this.progressBar = false;
        if (this._router.url === `/api/v1/planner/${Cookie.get('userId')}/user`) {
          document.location.reload();
        } else {
          this._router.navigate([`${GlobalConfig.apiVersion}/planner`, Cookie.get('userId'), 'user']);
        }
      }
    }, 1500)

  }

  public userAccess = () => {
    console.log(Cookie.get('userType'));
    let userTypeValue = Cookie.get('userType');
    if (userTypeValue === 'Admin') {
      console.log("Admin user hence access given")
      this.userAdminAccess = true;
      return this.userAdminAccess;
    } else {
      this.userAdminAccess = false;
      return this.userAdminAccess;
    }
  }
}
