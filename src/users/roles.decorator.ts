import { SetMetadata } from '@nestjs/common';
import { Role } from './entities/user.entity';

export const ROLES_KEY = 'ADMIN';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
