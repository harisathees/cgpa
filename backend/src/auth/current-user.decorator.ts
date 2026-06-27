import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from './types.js';

/**
 * Injects the authenticated user (populated by `JwtStrategy`).
 * Pass a property name to pick a single field, e.g. `@CurrentUser('id')`.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthUser }>();
    return data ? request.user[data] : request.user;
  },
);
