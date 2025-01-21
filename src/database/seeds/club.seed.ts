import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Club } from '../../modules/club/entities/club.entity';

@Injectable()
export class ClubSeed {
  constructor(private readonly connection: Connection) { }

  async run() {
    const clubRepository = this.connection.getRepository(Club);

    const clubs = [
      { name: "Barcelona", budget: 685000, remainingBudget: 685000 },
      { name: "Real Madrid", budget: 800000, remainingBudget: 800000 },
      { name: "Manchester United", budget: 600000, remainingBudget: 600000 },
      { name: "Liverpool", budget: 550000, remainingBudget: 550000 },
      { name: "Bayern Munich", budget: 700000, remainingBudget: 700000 },
      { name: "Paris Saint-Germain", budget: 750000, remainingBudget: 750000 },
      { name: "Juventus", budget: 500000, remainingBudget: 500000 },
      { name: "Chelsea", budget: 720000, remainingBudget: 720000 },
      { name: "Arsenal", budget: 480000, remainingBudget: 480000 },
      { name: "Inter Milan", budget: 650000, remainingBudget: 650000 }
    ];

    await clubRepository.save(clubs);
    console.log('Seed data for clubs added successfully!');
  }
}