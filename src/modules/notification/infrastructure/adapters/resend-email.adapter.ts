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
  <title>Verification Code - PE Market</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;">
                🔐 PE Market
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #333333;">
                Hello <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 24px; color: #666666;">
                Your verification code is ready. Please use the code below to complete your verification:
              </p>
              
              <!-- OTP Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px;">
                <tr>
                  <td align="center" style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                    <div style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Info Boxes -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px;">
                <tr>
                  <td style="padding: 16px; background-color: #fff8e6; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 12px;">
                    <p style="margin: 0; font-size: 14px; line-height: 20px; color: #856404;">
                      <strong>⏱️ Expires in 10 minutes</strong><br>
                      Please enter this code soon to complete your verification.
                    </p>
                  </td>
                </tr>
              </table>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 32px;">
                <tr>
                  <td style="padding: 16px; background-color: #fff3f3; border-left: 4px solid #dc3545; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; line-height: 20px; color: #721c24;">
                      <strong>🔒 Security Notice</strong><br>
                      Never share this code with anyone, including PE Market staff.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #999999;">
                If you didn't request this verification code, please ignore this email or <a href="mailto:support@pemarket.com" style="color: #667eea; text-decoration: none;">contact our support team</a>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px; font-size: 12px; line-height: 18px; color: #999999; text-align: center;">
                © ${new Date().getFullYear()} PE Market. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #999999; text-align: center;">
                This is an automated message, please do not reply to this email.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Extra Footer Links (Optional) -->
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #999999;">
                <a href="#" style="color: #999999; text-decoration: none; margin: 0 8px;">Help Center</a> |
                <a href="#" style="color: #999999; text-decoration: none; margin: 0 8px;">Privacy Policy</a> |
                <a href="#" style="color: #999999; text-decoration: none; margin: 0 8px;">Terms of Service</a>
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
