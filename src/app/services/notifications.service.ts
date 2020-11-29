import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { scan } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  messagesInput: Subject<Command>;
  messages: Observable<Command[]>;

  constructor() {
    this.messagesInput = new Subject<Command>();
    this.messages = this.messagesInput.pipe(
      scan((messages: Command[], command: Command) => {
        if (command.type === 'clear') {
          return messages.filter(message => message.id !== command.id);
        } else {
          return [...messages, command];
        }
      }, [])
    );
  }

  addSuccess(message: string) {
    const id = this.RandomId;
    this.messagesInput.next({
      id,
      type: 'success',
      text: message
    });

    setTimeout(() => {
      this.clearMesssage(id);
    }, 5000);
  }

  addError(message: string) {
    const id = this.RandomId;
    this.messagesInput.next({
      id,
      type: 'error',
      text: message
    });

    setTimeout(() => {
      this.clearMesssage(id);
    }, 5000);
  }

  clearMesssage(id: number) {
    this.messagesInput.next({
      id,
      type: 'clear'
    });
  }

  get RandomId() {
    return Math.round(Math.random() * 10000);
  }
}

export interface Command {
  id: number;
  type: 'success' | 'error' | 'clear';
  text?: string;
}