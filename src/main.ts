import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SeedsModule } from './database/seeds/seeds.module';
import { ClubSeed } from './database/seeds/club.seed';
import { PlayerSeed } from './database/seeds/player.seed';
import { CoachSeed } from './database/seeds/coach.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.RUN_SEEDS === 'true') {
    const seedsModule = app.select(SeedsModule);
    const clubSeed = seedsModule.get(ClubSeed);
    const playerSeed = seedsModule.get(PlayerSeed);
    const coachSeed = seedsModule.get(CoachSeed);
    
    await clubSeed.run(); 
    await playerSeed.run(); 
    await coachSeed.run(); 
  }

  app.setGlobalPrefix('api/v1')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
