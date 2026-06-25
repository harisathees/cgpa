import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protects routes by requiring a valid `Authorization: Bearer <jwt>` header.
 * Usage: `@UseGuards(JwtAuthGuard)`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
