import { Injectable, Logger } from '@nestjs/common';
import { EmailSenderPort } from '@/modules/notification/application/ports/email-sender.port';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResendEmailAdapter implements EmailSenderPort {
  private readonly logger = new Logger(ResendEmailAdapter.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.getOrThrow<string>('RESEND_FROM_EMAIL');
    this.resend = new Resend(apiKey);
  }

  async sendOtpEmail(
    email: string,
    otp: string,
    userName?: string,
  ): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Your OTP Verification Code - PE Market',
        html: this.getOtpEmailTemplate(userName || 'User', otp),
      });

      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }

      this.logger.log(`📧 Email sent successfully: ${data.id}`);
    } catch (error) {
      this.logger.error('❌ Failed to send email via Resend', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Welcome to PE Market! 🎉',
        html: this.getWelcomeEmailTemplate(userName),
      });

      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }

      this.logger.log(`📧 Welcome email sent: ${data.id}`);
    } catch (error) {
      this.logger.error('❌ Failed to send welcome email', error);
      throw error;
    }
  }

  private getOtpEmailTemplate(userName: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔐 PE Market</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">Hello ${userName}!</h2>
                      <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                        Your verification code is ready. Please use the code below to complete your verification:
                      </p>
                      
                      <!-- OTP Box -->
                      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
                        <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; display: inline-block;">
                          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
                            ${otp}
                          </span>
                        </div>
                      </div>
                      
                      <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        ⏱️ This code will expire in <strong>10 minutes</strong>.
                      </p>
                      <p style="margin: 10px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                        🔒 For security reasons, never share this code with anyone.
                      </p>
                      <p style="margin: 20px 0 0; color: #999999; font-size: 13px; line-height: 1.6; font-style: italic;">
                        If you didn't request this code, please ignore this email or contact our support team.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} PE Market. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        📧 This is an automated message, please do not reply.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to PE Market</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px; text-align: center;">
                      <h1 style="margin: 0 0 20px; color: #667eea; font-size: 32px;">🎉 Welcome to PE Market!</h1>
                      <h2 style="margin: 0 0 30px; color: #333333; font-size: 24px;">Hello ${userName},</h2>
                      <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                        Thank you for joining PE Market! Your account has been successfully verified.
                      </p>
                      <p style="margin: 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Start exploring amazing products and deals today!
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}
