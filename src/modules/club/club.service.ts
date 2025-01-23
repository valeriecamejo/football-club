import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Club } from './entities/club.entity';
import { Repository } from 'typeorm';
import { PlayerService } from '../player/player.service';
import { CoachService } from '../coach/coach.service';
import { handleDBExceptions } from '../../common/utils/db-exception.util';

@Injectable()
export class ClubService {

  private readonly logger = new Logger('ClubService');

  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    private readonly playerService: PlayerService,
    private readonly coachService: CoachService,
  ) { }

  // Create a new club
  async create(createClubDto: CreateClubDto) {
    try {
      const club = this.clubRepository.create(createClubDto);
      club.remainingBudget = club.budget;
      await this.clubRepository.save(club);
      return club;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
  // Find all clubs
  findAll() {
    try {
      return this.clubRepository.find({});
    } catch (error) {
      throw new Error('Error searching all clubs');
    }
    
  }

  // Find one club by id
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

  // Update a club's budget by id
  async update(id: number, updateClubDto: UpdateClubDto) {
    const { budget } = updateClubDto;

    let club;
    let players;
    let coaches;
    
    try {
      club = await this.findOne(id);
      if(budget === club.budget) return club;

      players = await this.playerService.getPlayersByClubId(id);
      coaches = await this.coachService.getCoachesByClubId(id);
    } catch (error) {
      throw new NotFoundException(
        `No information could be obtained from players or coaches associated with the club id ${id}.`
      );
    }

    let totalSalaryPlayersByClub = 0;
    players.forEach(player => {
      totalSalaryPlayersByClub += Number(player.salary);
    });

    let totalSalaryCoachesByClub = 0;
    coaches.forEach(coach => {
      totalSalaryCoachesByClub += Number(coach.salary);
    });

    const totalBudgetByClub = totalSalaryPlayersByClub + totalSalaryCoachesByClub;

    if (totalBudgetByClub > budget) {
      throw new BadRequestException(
        `The new budget is less than the total amount of club's salaries. Budget: ${budget}, Salaries: ${totalBudgetByClub}.`
      );
    }

    try {
      club.budget = budget;
      club.remainingBudget = budget - totalBudgetByClub;

      await this.clubRepository.update(id, { budget, remainingBudget: club.remainingBudget });

      return club;
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }
}
