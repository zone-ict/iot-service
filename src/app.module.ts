import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObnizModule } from './obniz/obniz.module';

@Module({
  imports: [ConfigModule.forRoot(), ObnizModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
