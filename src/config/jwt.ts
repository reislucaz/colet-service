import { ConfigService } from '@nestjs/config';
import { Env } from './env-schema';

export const getJwtConfig = (configService: ConfigService<Env>) => ({
  secret: configService.get('JWT_SECRET', { infer: true }),
  signOptions: {
    expiresIn: configService.get('JWT_EXPIRES_IN', { infer: true }),
  },
});
