import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  id: string = '';
  constructor() {}

  ngOnInit(): void {}
  setId(id: any) {
    console.log(id.target.value);
    this.id = id.target.value;
  }
}
