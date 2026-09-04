import { Notification } from './notification/notification';

export abstract class DomainEntity {
  public readonly notification: Notification;

  constructor() {
    this.notification = new Notification();
  }
}
