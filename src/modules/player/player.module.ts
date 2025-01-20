import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { Club } from '../club/entities/club.entity';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService],
  imports: [
    TypeOrmModule.forFeature([Player, Club])
  ]
})
export class PlayerModule {}
