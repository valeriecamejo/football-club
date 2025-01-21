import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coach } from './entities/coach.entity';
import { Repository } from 'typeorm';
import { Club } from '../club/entities/club.entity';
import { EmailService } from 'src/common/email/email.service';
import { handleDBExceptions } from 'src/common/utils/db-exception.util';

@Injectable()
export class CoachService {

  private readonly logger = new Logger('CoachService');

  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    private readonly emailService: EmailService
  ) { }

  async create(createCoachDto: CreateCoachDto) {
    try {
      const coach = this.coachRepository.create(createCoachDto);
      await this.coachRepository.save(coach);
      const { id, name } = coach;

      return { id, name };
    } catch (error) {
      handleDBExceptions(error, this.logger);
    }
  }

  async assignCoachToClub(coachId: number, updateCoachDto: UpdateCoachDto): Promise<Coach> {
    const { club_id, salary } = updateCoachDto;

    const coachDB = await this.coachRepository.findOne({ where: { id: coachId } });

    if (!coachDB) throw new NotFoundException(`Coach with id ${coachId} not found`);
    if (coachDB.club_id !== null) throw new BadRequestException(`Coach ${coachDB.name} is already associated in a club`);

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
  
    const coachToSave = { salary, club_id, club_name: club.name };

    await this.clubRepository.update(club_id, { remainingBudget: club.remainingBudget });
    await this.coachRepository.update(coachId, coachToSave);
    await this.emailService.sendEmail(coachDB.email, 'added', coachDB.name, club.name);

    coachDB.salary = salary;
    coachDB.club_id = club_id;
    coachDB.club_name = club.name;

    return coachDB;
  }

  async deleteCoachFromClub(coachId: number) {
    const coachDB = await this.coachRepository.findOne({ where: { id: coachId } });

    const clubId = coachDB.club_id;
    if (!coachDB) throw new NotFoundException(`Coach with id ${coachId} not found`);
    if (clubId == null) throw new BadRequestException(`Coach with id: ${coachId} is not associated with a club`);

    const club = await this.clubRepository.findOne({ where: { id: clubId } });

    const remainingBudget = club.remainingBudget + coachDB.salary;

    await this.clubRepository.update(clubId, { remainingBudget });
    await this.coachRepository.update(coachId, { club_id: null, club_name: null });
    await this.emailService.sendEmail(coachDB.email, 'deleted', coachDB.name, club.name);
    
    delete coachDB.club_id;
    delete coachDB.club_name;

    return coachDB;
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
    return this.cleanCoachResponse(coaches);
  }

  private async cleanCoachResponse(coaches) {
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
}
