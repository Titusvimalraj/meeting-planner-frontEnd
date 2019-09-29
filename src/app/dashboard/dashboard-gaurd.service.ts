import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class DashboardGaurdService {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    if (Cookie.get('authToken') === undefined || Cookie.get('authToken') === '' || Cookie.get('authToken') === null) {
      //console.log("in the guard service")
      this.router.navigate(['/']);
      return false;
    } else {
      return true;
    }

  }
}
