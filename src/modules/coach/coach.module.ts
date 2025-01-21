import { Module } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coach } from './entities/coach.entity';
import { Club } from '../club/entities/club.entity';
import { EmailService } from 'src/common/email/email.service';

@Module({
  controllers: [CoachController],
  providers: [CoachService, EmailService],
  imports: [
    TypeOrmModule.forFeature([Coach, Club])
  ]
})
export class CoachModule {}
