import { z } from 'zod';
import { EnvironmentsEnum } from '../utils/constants/environments-enum';

export const envSchema = z.object({
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_CURRENCY: z.string(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('24h'),
  UPLOAD_PATH: z.string().default('./uploads'),
  PORT: z.number().default(3000),
  NODE_ENV: z.enum(EnvironmentsEnum).default(EnvironmentsEnum.DEVELOPMENT),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
