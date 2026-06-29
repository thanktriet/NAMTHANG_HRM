import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator đánh dấu route là public (không cần xác thực)
 * @example @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
