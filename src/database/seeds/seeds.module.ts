import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubSeed } from './club.seed';
import { PlayerSeed } from './player.seed';
import { CoachSeed } from './coach.seed';

@Module({
  imports: [TypeOrmModule],
  providers: [ClubSeed, PlayerSeed, CoachSeed],
})
export class SeedsModule {}