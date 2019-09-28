import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { GlobalConfig } from '../globalConfig';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(private _router: Router,private _route: ActivatedRoute, private _location: Location) { }

  ngOnInit() {

  }
  public goBack = () => {
    this._router.navigate([`/${GlobalConfig.apiVersion}/users/login`]);
  }
}
