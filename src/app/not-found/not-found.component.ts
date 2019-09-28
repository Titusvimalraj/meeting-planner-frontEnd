import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(private _route: ActivatedRoute, private _location: Location) { }

  ngOnInit() {

  }
  public goBack = () => {
    this._location.back();
  }
}
