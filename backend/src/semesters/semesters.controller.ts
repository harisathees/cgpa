import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSemesterDto } from './dto/create-semester.dto.js';

/**
 * Example authenticated, user-scoped resource. Every handler requires a valid
 * JWT and only ever touches the caller's own semesters.
 */
@Controller('semesters')
@UseGuards(JwtAuthGuard)
export class SemestersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.prisma.semester.findMany({
      where: { userId },
      orderBy: { number: 'asc' },
      include: { courses: true },
    });
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateSemesterDto) {
    return this.prisma.semester.create({
      data: { userId, name: dto.name, number: dto.number },
    });
  }
}
