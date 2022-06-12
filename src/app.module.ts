import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObnizModule } from './obniz/obniz.module';

@Module({
  imports: [ObnizModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
