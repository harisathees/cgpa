import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Public health-check endpoint. */
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
