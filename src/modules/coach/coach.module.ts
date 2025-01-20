import { Module } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';

@Module({
  controllers: [CoachController],
  providers: [CoachService],
})
export class CoachModule {}
