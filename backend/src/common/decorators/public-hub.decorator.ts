import { SetMetadata } from '@nestjs/common';

export const PUBLIC_HUB_KEY = 'isPublicHub';
export const PublicHub = () => SetMetadata(PUBLIC_HUB_KEY, true);
