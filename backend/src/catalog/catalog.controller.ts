import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('colleges')
  colleges() {
    return this.catalog.getColleges();
  }

  @Get('degrees')
  degrees() {
    return this.catalog.getDegrees();
  }

  @Get('courses')
  courses(@Query('degree') degree: string) {
    return this.catalog.getCoursesForDegree(degree);
  }
}
