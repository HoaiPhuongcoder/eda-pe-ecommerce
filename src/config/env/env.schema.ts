import z from 'zod';

export const envSchema = z.object({
  ADMIN_NAME: z.string().min(1),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string().min(6),
  ADMIN_PHONE: z.string().min(10),
  DATABASE_URL: z.url(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  REDIS_PASSWORD: z.string(),
  KAFKA_BROKER: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;
