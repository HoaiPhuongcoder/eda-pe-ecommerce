import {
  EMAIL_SENDER_PORT,
  type EmailSenderPort,
} from '@/modules/notification/application/ports/email-sender.port';
import { SendOtpEmailJob } from '@/modules/notification/application/ports/queue.port';
import {
  NOTIFICATION_QUEUE,
  NotificationJobName,
} from '@/modules/notification/domain/constants/queue-name.constant';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor(NOTIFICATION_QUEUE, {
  concurrency: 5, // Process 5 jobs simultaneously
  limiter: {
    max: 10, // Max 10 jobs
    duration: 1000, // per 1 second (rate limiting)
  },
})
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(EMAIL_SENDER_PORT)
    private readonly emailSender: EmailSenderPort,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(
      `🔄 Processing job ${job.id} - ${job.name} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    );

    try {
      switch (job.name) {
        case NotificationJobName.SEND_OTP_EMAIL.toString():
          return await this.sendOtpEmail(job.data as SendOtpEmailJob);

        case NotificationJobName.SEND_WELCOME_EMAIL.toString():
          return await this.sendWelcomeEmail(
            job.data as {
              email: string;
              userName: string;
            },
          );

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(
        `❌ Job ${job.id} failed (attempt ${job.attemptsMade + 1}):`,
        error,
      );
      throw error; // BullMQ will retry
    }
  }

  private async sendOtpEmail(data: SendOtpEmailJob): Promise<void> {
    const { email, otp, userName } = data;
    await this.emailSender.sendOtpEmail(email, otp, userName);
    this.logger.log(`✅ OTP email sent successfully to ${email}`);
  }

  private async sendWelcomeEmail(data: {
    email: string;
    userName: string;
  }): Promise<void> {
    const { email, userName } = data;
    await this.emailSender.sendWelcomeEmail(email, userName);
    this.logger.log(`✅ Welcome email sent successfully to ${email}`);
  }

  // Event Listeners for monitoring
  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`✅ Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `❌ Job ${job.id} failed after ${job.attemptsMade} attempts:`,
      error,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`⚙️ Job ${job.id} is now active`);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`⚠️ Job ${jobId} has stalled`);
  }
}
