export const NOTIFICATION_QUEUE_PORT = Symbol('NOTIFICATION_QUEUE_PORT');

export interface SendOtpEmailJob {
  email: string;
  otp: string;
  userName?: string;
}

export interface NotificationQueuePort {
  addOtpEmailJob(data: SendOtpEmailJob, priority?: number): Promise<void>;
  addWelcomeEmailJob(data: { email: string; userName: string }): Promise<void>;
}
