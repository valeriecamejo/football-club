import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Club } from './entities/club.entity';
import { Repository } from 'typeorm';
import { PlayerService } from '../player/player.service';


@Injectable()
export class ClubService {

  private readonly logger = new Logger('ClubService');

  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    private readonly playerService: PlayerService, 
  ) { }

  async create(createClubDto: CreateClubDto) {
    try {
      const club = this.clubRepository.create(createClubDto);
      club.remainingBudget = club.budget;
      await this.clubRepository.save(club);
      return club;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll() {
    return this.clubRepository.find({});
  }

  async findOne(id: number) {
    try {
      const club = await this.clubRepository.findOneBy({ id });
      if (!club) throw new NotFoundException(`Club with id ${id} not found`);
      return club;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Club with id ${id} not found`);
      }
      throw new InternalServerErrorException(`Unexpected error searching for club ${id}`);
    }
  }

  async update(id: number, updateClubDto: UpdateClubDto) {
    const { budget } = updateClubDto;
    const club = await this.findOne(id);
    if (club.remainingBudget < budget) {
      throw new BadRequestException(
        `El nuevo presupuesto que se desea asociar es menor al monto total del pago de los
        jugadores y entrenadores. Nuevo presupuesto: ${budget}, Ttotal de los salarios del club: ${club.remainingBudget}`)
    }

    const players = await this.playerService.getPlayersByClubId(id);
    let toatlPlayers = 0;
    players.map(player => {
      toatlPlayers += player.salary;
    })
    
    try {
      club.budget = budget;
      club.remainingBudget = budget - toatlPlayers;
      await this.clubRepository.update(id, { budget, remainingBudget: club.remainingBudget });
      return club;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    const club = await this.findOne(id);
    await this.clubRepository.remove(club)
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
