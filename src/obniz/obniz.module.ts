import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ObnizController } from './obniz.controller';
import { ObnizService } from './obniz.service';

@Module({
  imports: [ConfigModule],
  controllers: [ObnizController],
  providers: [ObnizService],
  exports: [ObnizService],
})
export class ObnizModule {}
