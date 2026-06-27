import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Prisma + auth-gated modules are disabled while the public CGPA portal is in
// use. The portal reads its catalog from JSON on disk, so no DB is needed.
// import { PrismaModule } from './prisma/prisma.module.js';
// import { AuthModule } from './auth/auth.module.js';
// import { SemestersModule } from './semesters/semesters.module.js';
// import { AdminModule } from './admin/admin.module.js';
import { CatalogModule } from './catalog/catalog.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DiscoveryModule,
    // PrismaModule,
    // AuthModule,
    // SemestersModule,
    // AdminModule,
    CatalogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
