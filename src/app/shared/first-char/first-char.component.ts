import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-first-char',
  templateUrl: './first-char.component.html',
  styleUrls: ['./first-char.component.css']
})
export class FirstCharComponent implements OnInit {

  @Input() firstChar: string;
  @Input() userBg: string;
  @Input() userColor: string;

  constructor() { }

  ngOnInit() {
  }

}
