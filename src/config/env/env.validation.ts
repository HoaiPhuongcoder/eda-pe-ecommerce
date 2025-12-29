import { envSchema } from '@/config/env/env.schema';
import { ZodError } from 'zod';

export const validateEnvironment = (config: Record<string, unknown>) => {
  try {
    return envSchema.parse(config);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.issues.map((err) => {
        const path = err.path.join('.');
        return `❌ ENV ${path}: ${err.message}`;
      });

      throw new Error(
        `Environment validation failed:\n${formattedErrors.join('\n')}`,
      );
    }
    throw error;
  }
};
