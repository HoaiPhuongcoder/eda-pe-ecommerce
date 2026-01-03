import { AuthUser } from '@/modules/auth/domain/aggregates/auth-user-aggregate';

export const AUTH_USER_REPOSITORY = Symbol('AUTH_USER_REPOSITORY');

export interface AuthUserRepository {
  save(user: AuthUser): Promise<void>;
}
