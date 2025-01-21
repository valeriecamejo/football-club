import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Coach } from '../../modules/coach/entities/coach.entity';

@Injectable()
export class CoachSeed {
  constructor(private readonly connection: Connection) { }

  async run() {
    const coachRepository = this.connection.getRepository(Coach);

    const coaches = [
        { name: "Manuel Meza", email: "valerie260492@gmail.com" },
        { name: "Pep Guardiola", email: "pep@manchestercity.com" },
        { name: "Zinedine Zidane", email: "zidane@realmadrid.com" },
        { name: "Jürgen Klopp", email: "klopp@liverpool.com" },
        { name: "Mauricio Pochettino", email: "poch@psg.com" },
        { name: "Carlo Ancelotti", email: "ancelotti@realmadrid.com" },
        { name: "Thomas Tuchel", email: "tuchel@chelsea.com" },
        { name: "Antonio Conte", email: "conte@tottenham.com" },
        { name: "Diego Simeone", email: "simeone@atleticomadrid.com" },
        { name: "Julian Nagelsmann", email: "nagelsmann@bayernmunich.com" }
    ];

    await coachRepository.save(coaches);
    console.log('Seed data for coaches added successfully!');
  }
}