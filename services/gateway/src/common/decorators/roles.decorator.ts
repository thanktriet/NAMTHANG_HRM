import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator gán role yêu cầu cho route
 * @example @Roles('admin', 'hr_manager')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
