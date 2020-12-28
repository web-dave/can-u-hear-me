import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RoomComponent } from './room/room.component';
import { ChatComponent } from './chat/chat.component';
import { CallComponent } from './call/call.component';

@NgModule({
  declarations: [AppComponent, RoomComponent, ChatComponent, CallComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
