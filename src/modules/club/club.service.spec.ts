import { Test, TestingModule } from "@nestjs/testing"
import { ClubService } from "./club.service"
import { CoachService } from "../coach/coach.service"
import { PlayerService } from "../player/player.service"
import { Club } from "./entities/club.entity"
import { Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common"

describe("clubService", () => {
  let service: ClubService;
  let clubRepository: Repository<Club>;
  let coachService: CoachService;
  let playerService: PlayerService;

  const mockClubRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
  };

  const mockCoachService = {
    getCoachesByClubId: jest.fn().mockResolvedValue({}),
  };

  const mockPlayerService = {
    getPlayersByClubId: jest.fn().mockResolvedValue({}),
  };


  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ClubService,
        {
          provide: getRepositoryToken(Club),
          useValue: mockClubRepository,
        },
        {
          provide: getRepositoryToken(Club),
          useValue: mockClubRepository,
        },
        {
          provide: CoachService,
          useValue: mockCoachService,
        },
        {
          provide: PlayerService,
          useValue: mockPlayerService,
        },
      ],
    }).compile();

    service = module.get<ClubService>(ClubService);
    clubRepository = module.get<Repository<Club>>(getRepositoryToken(Club));
    clubRepository = module.get<Repository<Club>>(getRepositoryToken(Club));
    coachService = module.get<CoachService>(CoachService);
    playerService = module.get<PlayerService>(PlayerService);
  })

  test("Club service to be defined", () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    test('should successfully create a club', async () => {
      const createClubDto = { name: 'FC Barcelona', budget: 1000000 };
      const club = { id: 1, name: 'FC Barcelona', budget: 1000000, remainingBudget: 1000000 };

      mockClubRepository.create.mockReturnValue(club);
      mockClubRepository.save.mockResolvedValue(club);

      const result = await service.create(createClubDto);

      expect(result).toEqual(club);
      expect(mockClubRepository.create).toHaveBeenCalledWith(createClubDto);
      expect(mockClubRepository.save).toHaveBeenCalledWith(club);
    });

    test('should handle errors and call handleDBExceptions if save fails', async () => {
      const createClubDto = { name: 'FC Barcelona', budget: 1000000 };

      mockClubRepository.create.mockReturnValue(createClubDto);
      mockClubRepository.save.mockRejectedValue(new Error('Database error'));

      const loggerSpy = jest.spyOn(service['logger'], 'error');

      await expect(service.create(createClubDto)).rejects.toThrowError('Unexpected error, check server logs');
      expect(loggerSpy).toHaveBeenCalledWith(new Error('Database error'));
    });
  });

  describe('findAll', () => {
    test('should return all clubs', async () => {
      const clubs = [
        { id: 1, name: 'FC Barcelona', budget: 1000000, remainingBudget: 1000000 },
        { id: 2, name: 'Real Madrid', budget: 1200000, remainingBudget: 1200000 },
      ];

      mockClubRepository.find.mockResolvedValue(clubs);

      const result = await service.findAll();

      expect(result).toEqual(clubs);
      expect(mockClubRepository.find).toHaveBeenCalledWith({});
    });

    test('should handle errors and throw an error if find fails', async () => {
      mockClubRepository.find.mockRejectedValue(new Error('Error searching all clubs'));

      const loggerSpy = jest.spyOn(service['logger'], 'error');

      await expect(service.findAll()).rejects.toThrowError('Error searching all clubs');
    });
  });

  describe('findOne', () => {
    test('should return a club when found', async () => {
      const clubId = 1;
      const club = { id: clubId, name: 'FC Barcelona', budget: 1000000, remainingBudget: 1000000 };

      mockClubRepository.findOneBy.mockResolvedValue(club);

      const result = await service.findOne(clubId);

      expect(result).toEqual(club);
      expect(mockClubRepository.findOneBy).toHaveBeenCalledWith({ id: clubId });
    });

    test('should throw NotFoundException if club is not found', async () => {
      const clubId = 1;

      mockClubRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(clubId)).rejects.toThrowError(
        new NotFoundException(`Club with id ${clubId} not found`)
      );
      expect(mockClubRepository.findOneBy).toHaveBeenCalledWith({ id: clubId });
    });

    test('should throw InternalServerErrorException if there is a different error', async () => {
      const clubId = 1;

      mockClubRepository.findOneBy.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.findOne(clubId)).rejects.toThrowError(
        new InternalServerErrorException(`Unexpected error searching for club ${clubId}`)
      );
    });
  });

  describe('update', () => {
    test('should update the club budget and return the updated club', async () => {
      const clubId = 1;
      const updateClubDto = { budget: 2000000 };
      const club = { id: clubId, name: 'FC Barcelona', budget: 1000000, remainingBudget: 1000000 };
      const players = [{ salary: 300000 }];
      const coaches = [{ salary: 50000 }];
  
      mockClubRepository.findOneBy.mockResolvedValue(club);
      mockPlayerService.getPlayersByClubId.mockResolvedValue(players);
      mockCoachService.getCoachesByClubId.mockResolvedValue(coaches);
      mockClubRepository.update.mockResolvedValue({ ...club, ...updateClubDto });
  
      const result = await service.update(clubId, updateClubDto);

      const expectedRemainingBudget = updateClubDto.budget - (players[0].salary + coaches[0].salary);
  
      expect(result.budget).toBe(2000000);
      expect(result.remainingBudget).toBe(expectedRemainingBudget);
      expect(mockClubRepository.update).toHaveBeenCalledWith(clubId, { budget: 2000000, remainingBudget: expectedRemainingBudget });
    });

    test('should throw NotFoundException if players or coaches cannot be fetched', async () => {
      const clubId = 1;
      const updateClubDto = { budget: 2000000 };

      mockClubRepository.findOneBy.mockResolvedValue({ id: clubId });
      mockPlayerService.getPlayersByClubId.mockRejectedValue(new Error('Error fetching players'));
      mockCoachService.getCoachesByClubId.mockResolvedValue([]);

      await expect(service.update(clubId, updateClubDto)).rejects.toThrowError(
        new NotFoundException(`No information could be obtained from players or coaches associated with the club id ${clubId}.`)
      );
      expect(mockPlayerService.getPlayersByClubId).toHaveBeenCalledWith(clubId);
    });

    test('should throw BadRequestException if the new budget is less than the total salaries', async () => {
      const clubId = 1;
      const updateClubDto = { budget: 100000 };
      const club = { id: clubId, name: 'FC Barcelona', budget: 500000, remainingBudget: 500000 };
      const players = [{ salary: 300000 }];
      const coaches = [{ salary: 200000 }];

      mockClubRepository.findOneBy.mockResolvedValue(club);
      mockPlayerService.getPlayersByClubId.mockResolvedValue(players);
      mockCoachService.getCoachesByClubId.mockResolvedValue(coaches);

      await expect(service.update(clubId, updateClubDto)).rejects.toThrowError(
        new BadRequestException(
          `The new budget is less than the total amount of club's salaries. Budget: 100000, Salaries: 500000.`
        )
      );
      expect(mockClubRepository.findOneBy).toHaveBeenCalledWith({ id: clubId });
    });

    test('should handle database exceptions properly', async () => {
      const clubId = 1;
      const updateClubDto = { budget: 2000000 };
      const club = { id: clubId, name: 'FC Barcelona', budget: 1000000, remainingBudget: 1000000 };
      const players = [{ salary: 100000 }];
      const coaches = [{ salary: 50000 }];

      mockClubRepository.findOneBy.mockResolvedValue(club);
      mockPlayerService.getPlayersByClubId.mockResolvedValue(players);
      mockCoachService.getCoachesByClubId.mockResolvedValue(coaches);
      mockClubRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(service.update(clubId, updateClubDto)).rejects.toThrowError('Unexpected error, check server logs');
    });
  });
});