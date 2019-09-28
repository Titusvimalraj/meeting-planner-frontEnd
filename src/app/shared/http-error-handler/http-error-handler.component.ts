import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-http-error-handler',
  templateUrl: './http-error-handler.component.html',
  styleUrls: ['./http-error-handler.component.css']
})
export class HttpErrorHandlerComponent implements OnInit {

  public errorMessage;

  constructor(private _route: ActivatedRoute, private _location: Location) { }

  ngOnInit() {
    this.errorMessage = this._route.snapshot.queryParamMap.get('errorMessage');
  }
  public goBack = () => {
    this._location.back();
  }

}
