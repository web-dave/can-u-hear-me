import { Injectable, OnDestroy } from '@angular/core';
import { IMsg, IMsgType } from 'models/IMessage';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private socket$$ = new WebSocketSubject<IMsg>(environment.url);
  private chatSocket$$ = new Subject<IMsg>();
  private meetingSocket$$ = new Subject<IMsg>();
  private end$ = new Subject();

  name = '';
  room = '';
  id = '';
  attendees = new Map<string, string>();

  chatSocket$ = this.chatSocket$$.pipe(takeUntil(this.end$));
  meetingSocket$ = this.meetingSocket$$.pipe(takeUntil(this.end$));

  constructor() {
    this.socket$$
      .pipe(
        takeUntil(this.end$),
        tap((m) => {
          if (m.type === 'message') {
            this.chatSocket$$.next(m);
          }
        }),
        tap((m) => {
          if (m.type === 'available' || m.type === 'leave') {
            this.meetingSocket$$.next(m);
          }
        }),
        filter((m) => m.type === 'connection' || m.type === 'list')
      )
      .subscribe(
        (m) => {
          this.id = m.id;
          if (m.type === 'list') {
            console.log(m.message);
            this.attendees.clear();
            m.message.forEach((u: { id: string; name: string }) =>
              this.attendees.set(u.id, u.name)
            );
            console.log(this.attendees);
          }
        },
        (err) => {
          console.error(err);
          this.name = '';
          this.room = '';
        },
        () => console.info('CLOSED')
      );
  }
  sendMessage(
    message: string,
    id: string = this.id,
    type: IMsgType = 'message'
  ) {
    this.socket$$.next({ type, id, message });
  }

  getAttendeeName(id: string): string {
    return this.attendees.get(id) || 'na';
  }

  ngOnDestroy(): void {
    this.end$.next(1);
  }
}
