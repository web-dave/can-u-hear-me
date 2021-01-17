import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { IMsg } from 'models/IMessage';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnChanges {
  @Input() msg!: IMsg;
  @Output() send = new EventEmitter<string>();
  text: string = '';
  messages: IMsg[] = [];
  constructor() {}

  ngOnChanges(change: SimpleChanges): void {
    if (change.msg) {
      if (change.msg.currentValue) {
        this.messages.push(this.msg);
      }
    }
  }
  sendMessage(message: string) {
    this.send.emit(message);
    this.text = '';
  }
}
