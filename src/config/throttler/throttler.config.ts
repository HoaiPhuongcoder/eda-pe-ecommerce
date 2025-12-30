import { ThrottlerModule } from '@nestjs/throttler';
export const ThrottlerConfig = ThrottlerModule.forRoot({
  errorMessage:
    'Bạn đã yêu cầu làm mới quá nhanh. Vui lòng thử lại sau 1 phút.',
  throttlers: [
    {
      name: 'default',
      ttl: 10_000,
      limit: 10,
    },
  ],
});
