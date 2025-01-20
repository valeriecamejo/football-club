import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coach } from './entities/coach.entity';
import { Repository } from 'typeorm';
import { Club } from '../club/entities/club.entity';

@Injectable()
export class CoachService {

  private readonly logger = new Logger('CoachService');

  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
  ) {

  }

  async create(createCoachDto: CreateCoachDto) {

    try {
      const coach = this.coachRepository.create(createCoachDto);
      await this.coachRepository.save(coach);
      const { id, name } = coach;

      return { id, name };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async assignCoachToClub(coachId: number, updateCoachDto: UpdateCoachDto): Promise<Coach> {
    const { club_id, salary } = updateCoachDto;

    const coachDB = await this.coachRepository.findOne({ where: { id: coachId } });

    if (!coachDB) throw new NotFoundException(`Coach with id ${coachId} not found`);
    if (coachDB.club_id !== null) throw new BadRequestException(`Coach with id:${coachId} associated with another club`);

    const club = await this.clubRepository.findOne({ where: { id: club_id } });
    if (!club) {
      throw new NotFoundException(`Club with id ${club_id} not found`);
    }

    if (club.remainingBudget < salary) {
      throw new BadRequestException(
        `Insufficient budget in the club to hire the coach. Required: ${salary}, available: ${club.remainingBudget}`
      );
    }

    club.remainingBudget -= salary;
    await this.clubRepository.update(club_id, { remainingBudget: club.remainingBudget });

    coachDB.salary = salary;
    coachDB.club_id = club_id;
    await this.coachRepository.update(coachId, { salary, club_id });

    return coachDB;
  }

  /*
    - Validar que el coach es válido y si pertenece a un club
    - Eliminar la relación del coach con el club
    - Sumar salario del coah al remainingBudget del club
    - Actualizar coach
  */
  async deleteCoachFromClub(coachId: number) {
    return "test";
    /*const coachDB = await this.coachRepository.findOne({ where: { id: coachId } });

    if (!coachDB) throw new NotFoundException(`Coach with id ${coachId} not found`);
    if (coachDB.club_id !== null) throw new BadRequestException(`Coach with id:${coachId} associated with another club`);

    const club = await this.clubRepository.findOne({ where: { id: club_id } });
    if (!club) {
      throw new NotFoundException(`Club with id ${club_id} not found`);
    }

    if (club.remainingBudget < salary) {
      throw new BadRequestException(
        `Insufficient budget in the club to hire the coach. Required: ${salary}, available: ${club.remainingBudget}`
      );
    }

    club.remainingBudget -= salary;
    await this.clubRepository.update(club_id, { remainingBudget: club.remainingBudget });

    coachDB.salary = salary;
    coachDB.club_id = club_id;
    await this.coachRepository.update(coachId, { salary, club_id });

    return coachDB;*/
  }

  async getCoachesByClubId(club_id: number): Promise<Coach[]> {
    try {
      const coaches = await this.coachRepository.find({
        where: { club_id },
      });

      return coaches;
    } catch (error) {

    }
  }

  async findAll() {
    const coaches = await this.coachRepository.find({});
    return this.getCoach(coaches);
  }

  findOne(id: number) {
    return `This action returns a #${id} coach`;
  }

  update(id: number, updateCoachDto: UpdateCoachDto) {
    return `This action updates a #${id} coach`;
  }

  remove(coachId: number, clubId: number) {
    return `This action removes a #${coachId} coach ${clubId} `;
  }

  async getCoach(coaches) {
    const filteredCoaches = coaches.map(coach => {
      const filteredCoach = {};

      Object.keys(coach).forEach(key => {
        if (coach[key] !== null && coach[key] !== undefined) {
          filteredCoach[key] = coach[key];
        }
      });

      return filteredCoach;
    });

    return filteredCoaches;
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
