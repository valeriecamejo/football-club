import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { ILike, Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Club } from '../club/entities/club.entity';
import { EmailService } from '../../common/email/email.service';
import { handleDBExceptions } from '../../common/utils/db-exception.util';

@Injectable()
export class PlayerService {

  private readonly logger = new Logger('PlayerService');

  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    private readonly emailService: EmailService
  ) { }

  // Create a new player
  async create(createPlayerDto: CreatePlayerDto) {
    try {
      const player = this.playerRepository.create(createPlayerDto);
      await this.playerRepository.save(player);
      const { id, name, email } = player;

      return { id, name, email };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  // Assign a player to a club
  async assignPlayerToClub(playerId: number, createPlayerDto: UpdatePlayerDto): Promise<Player> {
    const { club_id, salary } = createPlayerDto;

    const playerDB = await this.playerRepository.findOne({ where: { id: playerId } });

    if (!playerDB) throw new NotFoundException(`Player with id ${playerId} not found`);
    if (playerDB.club_id !== null) throw new BadRequestException(`Player ${playerDB.name} is already associated in a club`);

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

    const dataToSave = { salary, club_id, club_name: club.name }

    await this.playerRepository.update(playerId, dataToSave);
    await this.emailService.sendEmail(playerDB.email, 'added', playerDB.name, club.name);

    playerDB.salary = salary;
    playerDB.club_id = club_id;
    playerDB.club_name = club.name;

    return playerDB;
  }

  // Find all players
  async findAll() {
    const players = await this.playerRepository.find({});
    return this.cleanPlayersResponse(players);
  }

  // Find one player by id
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

  // Get all players by club id
  async getPlayersByClubId(club_id: number): Promise<Player[]> {
    try {
      const players = await this.playerRepository.find({
        where: { club_id },
      });

      return players;
    } catch (error) {
      throw new Error('Error searching players by clubId');
    }
  }

  // Get players filtered by clubId and name
  async getPlayersByFilter(club_id: number, name: string, page: number, limit: number): Promise<Player[]> {
    const skip = (page - 1) * limit;

    const whereConditions = { club_id };
    if (name) whereConditions['name'] = ILike(`%${name}%`);

    const players = await this.playerRepository.find({
      where: whereConditions,
      skip,
      take: limit,
    });

    return players;
  }

  // Delete a player from a club
  async deletePlayerFromClub(playerId: number) {
    const playerDB = await this.playerRepository.findOne({ where: { id: playerId } });

    if (!playerDB) throw new NotFoundException(`Player with id ${playerId} not found`);
    const clubId = playerDB.club_id;
    if (clubId == null) throw new BadRequestException(`Player with id: ${playerId} is not associated with a club`);

    const club = await this.clubRepository.findOne({ where: { id: clubId } });

    const remainingBudget = club.remainingBudget + playerDB.salary;

    await this.clubRepository.update(clubId, { remainingBudget });
    await this.playerRepository.update(playerId, { club_id: null, club_name: null });
    await this.emailService.sendEmail(playerDB.email, 'deleted', playerDB.name, club.name);

    delete playerDB.club_id;
    delete playerDB.club_name

    return playerDB;
  }

  // Clean player response
  async cleanPlayersResponse(players) {
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
