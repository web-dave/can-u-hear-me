import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { MeetingComponent } from './meeting/meeting.component';
import { JoinComponent } from './join/join.component';

@NgModule({
  declarations: [AppComponent, ChatComponent, MeetingComponent, JoinComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
