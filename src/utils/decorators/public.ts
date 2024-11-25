import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('PUBLIC_ROUTE', true);
