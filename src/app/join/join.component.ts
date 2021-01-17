import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
})
export class JoinComponent {
  @Output() saveName = new EventEmitter<string>();
  @Output() saveRoom = new EventEmitter<string>();
  name: string = '';
  _name: string = '';
  _room: string = '';
  constructor() {}

  ngOnInit(): void {}
  setName(value: string) {
    this.name = value;
    this.saveName.emit(value);
    if (location.pathname !== '/') {
      this.setRoom(location.pathname.substring(1));
    }
  }
  setRoom(value: string) {
    this.saveRoom.emit(value);
  }
}
