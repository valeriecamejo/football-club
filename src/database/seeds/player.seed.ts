import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Player } from '../../modules/player/entities/player.entity';

@Injectable()
export class PlayerSeed {
  constructor(private readonly connection: Connection) { }

  async run() {
    const playerRepository = this.connection.getRepository(Player);

    const players = [
        { name: "Kysbel Aldeano", email: "valeriecamejo26@gmail.com" },
        { name: "Lionel Messi", email: "messi@barcelona.com" },
        { name: "Cristiano Ronaldo", email: "cristiano@manutd.com" },
        { name: "Mohamed Salah", email: "salah@liverpool.com" },
        { name: "Neymar Jr", email: "neymar@psg.com" },
        { name: "Kylian Mbappé", email: "mbappe@psg.com" },
        { name: "Kevin De Bruyne", email: "kevin@city.com" },
        { name: "Robert Lewandowski", email: "lewandowski@bayern.com" },
        { name: "Sergio Agüero", email: "kun@barcelona.com" },
        { name: "Harry Kane", email: "kane@tottenham.com" },
        { name: "Val Ber", email: "valerie260492@gmail.com" }
    ];

    await playerRepository.save(players);
    console.log('Seed data for players added successfully!');
  }
}