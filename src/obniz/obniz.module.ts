import { Module } from '@nestjs/common';
import { ObnizController } from './obniz.controller';
import { ObnizService } from './obniz.service';

@Module({
  controllers: [ObnizController],
  providers: [ObnizService],
  exports: [ObnizService],
})
export class ObnizModule {}
