import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-forgot-password-link',
  templateUrl: './forgot-password-link.component.html',
  styleUrls: ['./forgot-password-link.component.css']
})
export class ForgotPasswordLinkComponent implements OnInit {

  public email;

  constructor(private _route: ActivatedRoute, private _location: Location) {
    this.email = this._route.snapshot.paramMap.get('email');
  }

  ngOnInit() {
  }

  goBack = () => {
    this._location.back();
  }

}
