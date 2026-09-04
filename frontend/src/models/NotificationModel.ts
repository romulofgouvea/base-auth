export interface NotificationError {
  context: string;
  message: string;
}

export interface NotificationResponse {
  statusCode: number;
  message: string;
  errors: NotificationError[];
  timestamp: string;
}
