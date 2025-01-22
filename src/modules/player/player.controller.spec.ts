import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { GetPlayersQueryDto } from './dto/get-players-query.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PlayerController', () => {
  let controller: PlayerController;
  let service: PlayerService;

  const mockPlayerService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getPlayersByFilter: jest.fn(),
    assignPlayerToClub: jest.fn(),
    deletePlayerFromClub: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        {
          provide: PlayerService,
          useValue: mockPlayerService,
        },
      ],
    }).compile();

    controller = module.get<PlayerController>(PlayerController);
    service = module.get<PlayerService>(PlayerService);
  });

  test('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPlayer', () => {
    test('should successfully create a player', async () => {
      const createPlayerDto: CreatePlayerDto = { name: 'Lionel Messi', email: 'messi@gmail.com' };
      const result = { id: 1, name: 'Lionel Messi', email: 'messi@gmail.com' };

      mockPlayerService.create.mockResolvedValue(result);

      const response = await controller.createPlayer(createPlayerDto);
      expect(response).toEqual(result);
      expect(mockPlayerService.create).toHaveBeenCalledWith(createPlayerDto);
    });

    test('should throw error when creation fails', async () => {
      const createPlayerDto: CreatePlayerDto = { name: 'Lionel Messi', email: 'messi@gmail.com' };

      mockPlayerService.create.mockRejectedValue(new Error('Database error'));

      await expect(controller.createPlayer(createPlayerDto)).rejects.toThrowError('Database error');
    });
  });

  describe('findAll', () => {
    test('should return all players', async () => {
      const players = [
        { id: 1, name: 'Lionel Messi', email: 'messi@gmail.com' },
        { id: 2, name: 'Cristiano Ronaldo', email: 'cr7@gmail.com' },
      ];

      mockPlayerService.findAll.mockResolvedValue(players);

      const response = await controller.findAll();
      expect(response).toEqual(players);
      expect(mockPlayerService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    test('should return a player by id', async () => {
      const playerId = 1;
      const player = { id: playerId, name: 'Lionel Messi', email: 'messi@gmail.com' };

      mockPlayerService.findOne.mockResolvedValue(player);

      const response = await controller.findOne(playerId);
      expect(response).toEqual(player);
      expect(mockPlayerService.findOne).toHaveBeenCalledWith(playerId);
    });
  });

  describe('getPlayersByFilter', () => {
    test('should return players by filter', async () => {
      const clubId = 1;
      const query: GetPlayersQueryDto = { name: 'Messi', page: 1, limit: 10 };
      const players = [
        { id: 1, name: 'Lionel Messi', email: 'messi@gmail.com' },
      ];

      mockPlayerService.getPlayersByFilter.mockResolvedValue(players);

      const response = await controller.getPlayersByFilter(clubId, query);
      expect(response).toEqual(players);
      expect(mockPlayerService.getPlayersByFilter).toHaveBeenCalledWith(clubId, query.name, query.page, query.limit);
    });
  });

  describe('assignPlayerToClub', () => {
    test('should successfully assign player to club', async () => {
      const playerId = 1;
      const updatePlayerDto: UpdatePlayerDto = { club_id: 1, salary: 100000 };
      const player = { id: playerId, name: 'Lionel Messi', email: 'messi@gmail.com', club_id: null };

      mockPlayerService.assignPlayerToClub.mockResolvedValue(player);

      const response = await controller.assignPlayerToClub(playerId, updatePlayerDto);
      expect(response).toEqual(player);
      expect(mockPlayerService.assignPlayerToClub).toHaveBeenCalledWith(playerId, updatePlayerDto);
    });
  });

  describe('deletePlayerFromClub', () => {
    test('should successfully delete player from club', async () => {
      const playerId = 1;
      const player = { id: playerId, name: 'Lionel Messi', email: 'messi@gmail.com', club_id: 1 };

      mockPlayerService.deletePlayerFromClub.mockResolvedValue(player);

      const response = await controller.deleteCoachFromClub(playerId);
      expect(response).toEqual(player);
      expect(mockPlayerService.deletePlayerFromClub).toHaveBeenCalledWith(playerId);
    });
  });
});