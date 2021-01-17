import { Injectable, OnDestroy } from '@angular/core';
import { IMsg, IMsgType } from 'models/IMessage';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private socket$$ = new WebSocketSubject<IMsg>(environment.url);
  private end$ = new Subject();

  name = '';
  room = '';
  id = '';
  attendees = new Map<string, string>();

  chatSocket$ = this.socket$$.pipe(
    takeUntil(this.end$),
    filter((m) => m.type === 'message')
  );
  meetingSocket$ = this.socket$$.pipe(
    takeUntil(this.end$),
    filter((m) => m.type === 'available' || m.type === 'leave')
  );

  constructor() {
    this.socket$$
      .pipe(
        takeUntil(this.end$),
        filter((m) => m.type === 'connection' || m.type === 'list')
      )
      .subscribe(
        (m) => {
          this.id = m.id;
          if (m.type === 'list') {
            m.message.forEach((u: { id: string; name: string }) =>
              this.attendees.set(u.id, u.name)
            );
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
