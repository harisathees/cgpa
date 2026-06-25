import type { Role } from '../generated/prisma/enums.js';

/** Shape of the authenticated user attached to the request by JwtStrategy. */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
}

/** Decoded JWT payload. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
