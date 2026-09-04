import { NotificationError } from './notification-error.interface';

export class NotificationException extends Error {
  constructor(public readonly errors: NotificationError[]) {
    super(errors.map((e) => `${e.context}: ${e.message}`).join(', '));
    this.name = 'NotificationException';
  }
}
