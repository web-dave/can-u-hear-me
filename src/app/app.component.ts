import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'can-u-hear-me';
  roomId: string = '';
  call = false;
  chat = false;
  end$ = new Subject();
  id: string = '';
  constructor(private route: ActivatedRoute, private service: SocketService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((data) => (this.roomId = data.roomid));
    this.service.id$
      .pipe(
        takeUntil(this.end$),
        filter((data) => data !== '')
      )
      .subscribe((data) => (this.id = data));
  }
}
