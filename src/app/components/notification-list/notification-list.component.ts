import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationsService, Command } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {

  messages: Observable<Command[]>;

  constructor(private notificationService: NotificationsService) { }

  ngOnInit() {
    this.messages = this.notificationService.messages;
  }

  clearMessage(id: number) {
    this.notificationService.clearMesssage(id);
  }
}
