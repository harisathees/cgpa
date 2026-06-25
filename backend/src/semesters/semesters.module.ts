import { Module } from '@nestjs/common';
import { SemestersController } from './semesters.controller.js';

@Module({
  controllers: [SemestersController],
})
export class SemestersModule {}
