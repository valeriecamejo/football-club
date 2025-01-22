import { Test, TestingModule } from '@nestjs/testing';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { get } from 'http';

describe('ClubController', () => {
  let controller: ClubController;
  let service: ClubService;

  const mockPlayerService = {
    getPlayersByClubId: jest.fn(),
  };

  const mockCoachService = {
    getCoachesByClubId: jest.fn(),
  };

  const mockClubService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClubController],
      providers: [
        {
          provide: ClubService,
          useValue: mockClubService,
        },
      ],
    }).compile();

    controller = module.get<ClubController>(ClubController);
    service = module.get<ClubService>(ClubService);
  });

  test('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    test('should successfully create a club', async () => {
      const createClubDto: CreateClubDto = { name: 'FC Barcelona', budget: 1000000 };
      const club = { id: 1, name: 'FC Barcelona', budget: 1000000, remainingBudget: 1000000 };

      mockClubService.create.mockResolvedValue(club);

      const result = await controller.create(createClubDto);

      expect(result).toEqual(club);
      expect(mockClubService.create).toHaveBeenCalledWith(createClubDto);
    });
  });

  describe('findAll', () => {
    test('should return all clubs', async () => {
      const clubs = [
        { id: 1, name: 'FC Barcelona', budget: 1000000, remainingBudget: 1000000 },
        { id: 2, name: 'Real Madrid', budget: 1200000, remainingBudget: 1200000 },
      ];

      mockClubService.findAll.mockResolvedValue(clubs);

      const result = await controller.findAll();

      expect(result).toEqual(clubs);
      expect(mockClubService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    test('should return a club by id', async () => {
      const clubId = 1;
      const club = { id: clubId, name: 'FC Barcelona', budget: 1000000, remainingBudget: 1000000 };

      mockClubService.findOne.mockResolvedValue(club);

      const result = await controller.findOne(clubId);

      expect(result).toEqual(club);
      expect(mockClubService.findOne).toHaveBeenCalledWith(clubId);
    });
  });

  describe('update', () => {
    test('should update a club and return the updated club', async () => {
      const clubId = 1;
      const updateClubDto: UpdateClubDto = { budget: 2000000 };
      const club = { id: clubId, name: 'FC Barcelona', budget: 1000000, remainingBudget: 1000000 };
      const players = [{ salary: 300000 }];
      const coaches = [{ salary: 500000 }];
  
      const totalSalaryByClub = players.reduce((acc, player) => acc + player.salary, 0) + coaches.reduce((acc, coach) => acc + coach.salary, 0);
      const remainingBudget = updateClubDto.budget - totalSalaryByClub;

      mockClubService.findOne.mockResolvedValue(club);
      mockPlayerService.getPlayersByClubId.mockResolvedValue(players);
      mockCoachService.getCoachesByClubId.mockResolvedValue(coaches);

      mockClubService.update.mockResolvedValue({
        ...club,
        ...updateClubDto,
        remainingBudget: remainingBudget,
      });
  
      const result = await controller.update(clubId, updateClubDto);

      expect(result.budget).toBe(2000000);
      expect(result.remainingBudget).toBe(1200000);
      expect(mockClubService.update).toHaveBeenCalledWith(
        clubId,
        { budget: 2000000 }
      );
    });
  });
});