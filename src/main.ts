import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SeedsModule } from './database/seeds/seeds.module';
import { ClubSeed } from './database/seeds/club.seed';
import { PlayerSeed } from './database/seeds/player.seed';
import { CoachSeed } from './database/seeds/coach.seed';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Football Club API Documentation')
    .setDescription('This is the API documentation for club, player and coach management.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);  // Crear el documento Swagger
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
