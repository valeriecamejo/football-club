import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { Club } from '../club/entities/club.entity';
import { EmailService } from '../../common/email/email.service';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService, EmailService],
  imports: [
    TypeOrmModule.forFeature([Player, Club])
  ]
})
export class PlayerModule {}
