import { Module } from '@nestjs/common';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from './entities/club.entity';
import { Coach } from '../coach/entities/coach.entity';
import { Player } from '../player/entities/player.entity';
import { PlayerService } from '../player/player.service';
import { CoachService } from '../coach/coach.service';
import { EmailService } from '../../common/email/email.service';

@Module({
  controllers: [ClubController],
  providers: [ClubService, PlayerService, CoachService, EmailService],
  imports: [
    TypeOrmModule.forFeature([Club, Player, Coach])
  ]
})
export class ClubModule { }
