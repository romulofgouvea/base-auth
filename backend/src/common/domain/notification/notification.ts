import { NotificationError } from './notification-error.interface';

export class Notification {
  private errors: NotificationError[] = [];

  addError(error: NotificationError): void {
    this.errors.push(error);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): NotificationError[] {
    return this.errors;
  }

  messages(context?: string): string {
    let filteredErrors = this.errors;

    if (context) {
      filteredErrors = this.errors.filter((error) => error.context === context);
    }

    return filteredErrors
      .map((error) => `${error.context}: ${error.message}`)
      .join(', ');
  }
}
