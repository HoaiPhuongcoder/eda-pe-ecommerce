export const EMAIL_SENDER_PORT = Symbol('EMAIL_SENDER_PORT');

export interface EmailSenderPort {
  sendOtpEmail(email: string, otp: string, userName?: string): Promise<void>;
  sendWelcomeEmail(email: string, userName: string): Promise<void>;
}
