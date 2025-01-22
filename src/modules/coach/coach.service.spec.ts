import { Test, TestingModule } from "@nestjs/testing"
import { CoachService } from "./coach.service"
import { EmailService } from "../../common/email/email.service"
import { Coach } from "./entities/coach.entity"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Club } from "../club/entities/club.entity"
import { BadRequestException, NotFoundException } from "@nestjs/common"

describe("coachService", () => {
  let service: CoachService;
  let coachRepository: Repository<Coach>;
  let clubRepository: Repository<Club>;
  let emailService: EmailService;

  const mockCoachRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
  };

  const mockClubRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        CoachService,
        {
          provide: getRepositoryToken(Coach),
          useValue: mockCoachRepository,
        },
        {
          provide: getRepositoryToken(Club),
          useValue: mockClubRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<CoachService>(CoachService);
    coachRepository = module.get<Repository<Coach>>(getRepositoryToken(Coach));
    clubRepository = module.get<Repository<Club>>(getRepositoryToken(Club));
    emailService = module.get<EmailService>(EmailService);
  })

  test("Coach service to be defined", () => {
    expect(service).toBeDefined();
  })

  describe('create', () => {
    test('should successfully create a coach and return id and name', async () => {
      const createCoachDto = { name: 'Mario Benetto', email: 'mario@gmail.com' };
      const result = { id: 1, name: 'Mario Benetto' };

      mockCoachRepository.create.mockImplementation(() => result);
      mockCoachRepository.save.mockResolvedValue(result);

      const response = await service.create(createCoachDto);

      expect(response).toEqual({ id: 1, name: 'Mario Benetto' });
      expect(coachRepository.create).toHaveBeenCalledWith(createCoachDto);
      expect(coachRepository.save).toHaveBeenCalledWith(result);
    });

    test('should throw an error if create or save fails', async () => {
      const createCoachDto = { name: 'Mario Benetto', email: 'mario@gmail.com' };

      mockCoachRepository.create.mockImplementation(() => createCoachDto);
      mockCoachRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createCoachDto)).rejects.toThrowError('Unexpected error, check server logs');
      expect(coachRepository.create).toHaveBeenCalledWith(createCoachDto);
      expect(coachRepository.save).toHaveBeenCalled();
    });
  });

  describe('assignCoachToClub', () => {
    test('should successfully assign coach to a club', async () => {
      const coachId = 1;
      const updateCoachDto = { club_id: 2, salary: 50000 };
      const coachDB = { id: coachId, name: 'Mario Benetto', club_id: null, email: 'mario@gmail.com' };
      const club = { id: 2, name: 'FC Barcelona', remainingBudget: 100000 };

      mockCoachRepository.findOne.mockResolvedValue(coachDB);  // Simulate finding the coach
      mockClubRepository.findOne.mockResolvedValue(club);  // Simulate finding the club
      mockCoachRepository.update.mockResolvedValue({ ...coachDB, ...updateCoachDto });  // Simulate updating the coach
      mockClubRepository.update.mockResolvedValue(club);  // Simulate updating the club
      mockEmailService.sendEmail.mockResolvedValue(true);  // Simulate sending the email

      const result = await service.assignCoachToClub(coachId, updateCoachDto);

      expect(result.club_id).toBe(2);
      expect(result.salary).toBe(50000);
      expect(result.club_name).toBe('FC Barcelona');
      expect(mockCoachRepository.findOne).toHaveBeenCalledWith({ where: { id: coachId } });
      expect(mockClubRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(mockCoachRepository.update).toHaveBeenCalledWith(coachId, { salary: 50000, club_id: 2, club_name: 'FC Barcelona' });
      expect(mockClubRepository.update).toHaveBeenCalledWith(2, { remainingBudget: 50000 });
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(coachDB.email, 'added', coachDB.name, club.name);
    });

    test('should throw NotFoundException if coach not found', async () => {
      const coachId = 1;
      const updateCoachDto = { club_id: 2, salary: 50000 };

      // Simulating the coach not being found
      mockCoachRepository.findOne.mockResolvedValue(null);

      await expect(service.assignCoachToClub(coachId, updateCoachDto))
        .rejects
        .toThrowError(new NotFoundException(`Coach with id ${coachId} not found`));

      expect(mockCoachRepository.findOne).toHaveBeenCalledWith({ where: { id: coachId } });
    });

    test('should throw BadRequestException if coach is already associated with a club', async () => {
      const coachId = 1;
      const updateCoachDto = { club_id: 2, salary: 50000 };
      const coachDB = { id: coachId, name: 'Mario Benetto', club_id: 1, email: 'mario@gmail.com' };

      // Simulating the coach already being associated with a club
      mockCoachRepository.findOne.mockResolvedValue(coachDB);

      await expect(service.assignCoachToClub(coachId, updateCoachDto))
        .rejects
        .toThrowError(new BadRequestException(`Coach ${coachDB.name} is already associated in a club`));

      expect(mockCoachRepository.findOne).toHaveBeenCalledWith({ where: { id: coachId } });
    });

    test('should throw NotFoundException if club not found', async () => {
      const coachId = 1;
      const updateCoachDto = { club_id: 2, salary: 50000 };
      const coachDB = { id: coachId, name: 'Mario Benetto', club_id: null, email: 'mario@gmail.com' };

      // Simulating the club not being found
      mockCoachRepository.findOne.mockResolvedValue(coachDB);
      mockClubRepository.findOne.mockResolvedValue(null);

      await expect(service.assignCoachToClub(coachId, updateCoachDto))
        .rejects
        .toThrowError(new NotFoundException(`Club with id ${updateCoachDto.club_id} not found`));

      expect(mockCoachRepository.findOne).toHaveBeenCalledWith({ where: { id: coachId } });
      expect(mockClubRepository.findOne).toHaveBeenCalledWith({ where: { id: updateCoachDto.club_id } });
    });

    test('should throw BadRequestException if club budget is insufficient', async () => {
      const coachId = 1;
      const updateCoachDto = { club_id: 2, salary: 50000 };
      const coachDB = { id: coachId, name: 'Mario Benetto', club_id: null, email: 'mario@gmail.com' };
      const club = { id: 2, name: 'FC Barcelona', remainingBudget: 30000 };  // Insufficient budget

      // Simulating the coach and club being found
      mockCoachRepository.findOne.mockResolvedValue(coachDB);
      mockClubRepository.findOne.mockResolvedValue(club);

      await expect(service.assignCoachToClub(coachId, updateCoachDto))
        .rejects
        .toThrowError(new BadRequestException(
          `Insufficient budget in the club to hire the coach. Required: ${updateCoachDto.salary}, available: ${club.remainingBudget}`
        ));

      expect(mockCoachRepository.findOne).toHaveBeenCalledWith({ where: { id: coachId } });
      expect(mockClubRepository.findOne).toHaveBeenCalledWith({ where: { id: updateCoachDto.club_id } });
    });
  });

  describe("deleteCoachFromClub", () => {
    test("should successfully delete a coach from a club", async () => {
      const coachId = 1;
      const coachDB = { id: coachId, name: "Mario Benetto", club_id: 2, email: "mario@gmail.com", salary: 50000 };
      const club = { id: 2, name: "FC Barcelona", remainingBudget: 100000 };

      // Mocking repository methods
      mockCoachRepository.findOne.mockResolvedValue(coachDB);
      mockClubRepository.findOne.mockResolvedValue(club);
      mockCoachRepository.update.mockResolvedValue({ ...coachDB, club_id: null, club_name: null });
      mockClubRepository.update.mockResolvedValue({ ...club, remainingBudget: club.remainingBudget + coachDB.salary });
      mockEmailService.sendEmail.mockResolvedValue(true);

      await service.deleteCoachFromClub(coachId);

      expect(mockCoachRepository.findOne).toHaveBeenCalledWith({ where: { id: coachId } });
      expect(mockClubRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(mockCoachRepository.update).toHaveBeenCalledWith(coachId, { club_id: null, club_name: null });
      expect(mockClubRepository.update).toHaveBeenCalledWith(2, { remainingBudget: club.remainingBudget + coachDB.salary });
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(coachDB.email, "deleted", coachDB.name, club.name);
    });

    test("should throw NotFoundException if coach is not found", async () => {
      const coachId = 1;
      mockCoachRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteCoachFromClub(coachId)).rejects.toThrowError(
        new NotFoundException(`Coach with id ${coachId} not found`)
      );
    });

    test("should throw BadRequestException if coach is not associated with a club", async () => {
      const coachId = 1;
      const coachDB = { id: coachId, name: "Mario Benetto", club_id: null, email: "mario@gmail.com", salary: 50000 };

      mockCoachRepository.findOne.mockResolvedValue(coachDB);

      await expect(service.deleteCoachFromClub(coachId)).rejects.toThrowError(
        new BadRequestException(`Coach with id: ${coachId} is not associated with a club`)
      );
    });

    test("should throw NotFoundException if club is not found", async () => {
      const coachId = 1;
      const coachDB = {
        id: coachId,
        name: "Mario Benetto",
        club_id: 2,
        email: "mario@gmail.com",
        salary: 50000,
        remainingBudget: 1000000
      };

      mockCoachRepository.findOne.mockResolvedValue(coachDB);
      mockClubRepository.findOne.mockRejectedValue(new Error(`Club with id ${coachDB.id} not found`));

      await expect(service.deleteCoachFromClub(coachId)).rejects.toThrowError(
        new NotFoundException(`Club with id ${coachDB.id} not found`)
      );
    });
  });

  describe('getCoachesByClubId', () => {
    test('should return a list of coaches for the given club_id', async () => {
      const clubId = 1;
      const coaches = [
        { id: 1, name: 'Mario Benetto', email: 'mario@gmail.com', salary: 50000, club_id: clubId },
        { id: 2, name: 'John Doe', email: 'john.doe@gmail.com', salary: 60000, club_id: clubId },
      ];

      mockCoachRepository.find.mockResolvedValue(coaches);

      const result = await service.getCoachesByClubId(clubId);

      expect(result).toEqual(coaches);
      expect(mockCoachRepository.find).toHaveBeenCalledWith({ where: { club_id: clubId } });
    });

    test('should throw an error if find method fails', async () => {
      const clubId = 1;

      mockCoachRepository.find.mockRejectedValue(new Error('Error searching coaches by clubId'));

      await expect(service.getCoachesByClubId(clubId)).rejects.toThrowError('Error searching coaches by clubId');
      expect(mockCoachRepository.find).toHaveBeenCalledWith({ where: { club_id: clubId } });
    });
  });

  describe('findAll', () => {
    test('should return a list of coaches', async () => {
      const result = [
        { id: 1, name: 'Coach 1', email: 'coach1@example.com' },
        { id: 2, name: 'Coach 2', email: 'coach2@example.com' },
      ];

      mockCoachRepository.find.mockResolvedValue(result);
      const response = await service.findAll();

      expect(response).toEqual(result);
      expect(mockCoachRepository.find).toHaveBeenCalledWith({});
    });

    test('should return an empty list when no coaches are found', async () => {
      mockCoachRepository.find.mockResolvedValue([]);

      const response = await service.findAll();

      expect(response).toEqual([]);
      expect(mockCoachRepository.find).toHaveBeenCalledWith({});
    });

    test('should throw an error if find method fails', async () => {
      const errorMessage = 'Database error';

      mockCoachRepository.find.mockRejectedValue(new Error(errorMessage));

      await expect(service.findAll()).rejects.toThrowError(errorMessage);
      expect(mockCoachRepository.find).toHaveBeenCalledWith({});
    });
  });
})