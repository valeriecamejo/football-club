import { Module } from '@nestjs/common';
import { ClubModule } from './modules/club/club.module';
import { PlayerModule } from './modules/player/player.module';
import { CoachModule } from './modules/coach/coach.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedsModule } from './database/seeds/seeds.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClubModule,
    PlayerModule,
    CoachModule,
    SeedsModule,

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class AppModule { }
