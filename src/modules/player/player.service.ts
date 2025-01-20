import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Club } from '../club/entities/club.entity';

@Injectable()
export class PlayerService {

  private readonly logger = new Logger('PlayerService');

  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
  ) {

  }

  async create(createPlayerDto: CreatePlayerDto) {

    try {
      const player = this.playerRepository.create(createPlayerDto);
      await this.playerRepository.save(player);
      const { id, name } = player;

      return { id, name };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async assignPlayerToClub(playerId: number, createPlayerDto: UpdatePlayerDto): Promise<Player> {
    const { club_id, salary } = createPlayerDto;

    const playerDB = await this.playerRepository.findOne({ where: { id: playerId } });
    if (!playerDB) {
      throw new NotFoundException(`Player with id ${playerId} not found`);
    }

    const club = await this.clubRepository.findOne({ where: { id: club_id } });
    if (!club) {
      throw new NotFoundException(`Club with id ${club_id} not found`);
    }

    if (club.remainingBudget < salary) {
      throw new BadRequestException(
        `Insufficient budget in the club to hire the player. Required: ${salary}, available: ${club.remainingBudget}`
      );
    }

    club.remainingBudget -= salary;
    await this.clubRepository.update(club_id, { remainingBudget: club.remainingBudget });

    playerDB.salary = salary;
    playerDB.club_id = club_id;
    await this.playerRepository.update(playerId, { salary, club_id });

    return playerDB;
  }

  async findAll() {
    const players = await this.playerRepository.find({});
    return this.getPlayers(players);
  }

  async findOne(id: number) {
    try {
      const player = await this.playerRepository.findOneBy({ id });
      if (!player) throw new NotFoundException(`Player with id ${id} not found`);
      return player;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Player with id ${id} not found`);
      }
      throw new InternalServerErrorException(`Unexpected error searching for player ${id}`);
    }
  }

  async getPlayersByClubId(club_id: number): Promise<Player[]> {
    try {
      const players = await this.playerRepository.find({
        where: { club_id },
      });

      return players;
    } catch (error) {

    }
  }

  update(id: number, updatePlayerDto: UpdatePlayerDto) {
    return `This action updates a #${id} player`;
  }

  remove(id: number) {
    return `This action removes a #${id} player`;
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  async getPlayers(players) {
    const filteredPlayers = players.map(player => {
      const filteredPlayer = {};

      Object.keys(player).forEach(key => {
        if (player[key] !== null && player[key] !== undefined) {
          filteredPlayer[key] = player[key];
        }
      });

      return filteredPlayer;
    });

    return filteredPlayers;
  }
}
