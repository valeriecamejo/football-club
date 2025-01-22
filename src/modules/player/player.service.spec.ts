import { Test, TestingModule } from "@nestjs/testing"
import { PlayerService } from "./player.service"
import { EmailService } from "../../common/email/email.service"
import { Player } from "./entities/player.entity"
import { ILike, Repository } from "typeorm"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Club } from "../club/entities/club.entity"
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common"

describe("playerService", () => {
  let service: PlayerService;
  let playerRepository: Repository<Player>;
  let clubRepository: Repository<Club>;
  let emailService: EmailService;

  const mockPlayerRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
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
        PlayerService,
        {
          provide: getRepositoryToken(Player),
          useValue: mockPlayerRepository,
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

    service = module.get<PlayerService>(PlayerService);
    playerRepository = module.get<Repository<Player>>(getRepositoryToken(Player));
    clubRepository = module.get<Repository<Club>>(getRepositoryToken(Club));
    emailService = module.get<EmailService>(EmailService);
  })

  test("Player service to be defined", () => {
    expect(service).toBeDefined();
  })

  describe('create', () => {
    test('should successfully create a player and return id and name', async () => {
      const createPlayerDto = { name: 'Mario Benetto', email: 'mario@gmail.com' };
      const result = { id: 1, name: 'Mario Benetto' };

      mockPlayerRepository.create.mockImplementation(() => result);
      mockPlayerRepository.save.mockResolvedValue(result);

      const response = await service.create(createPlayerDto);

      expect(response).toEqual({ id: 1, name: 'Mario Benetto' });
      expect(playerRepository.create).toHaveBeenCalledWith(createPlayerDto);
      expect(playerRepository.save).toHaveBeenCalledWith(result);
    });

    test('should throw an error if create or save fails', async () => {
      const createPlayerDto = { name: 'Mario Benetto', email: 'mario@gmail.com' };

      mockPlayerRepository.create.mockImplementation(() => createPlayerDto);
      mockPlayerRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createPlayerDto)).rejects.toThrowError('Unexpected error, check server logs');
      expect(playerRepository.create).toHaveBeenCalledWith(createPlayerDto);
      expect(playerRepository.save).toHaveBeenCalled();
    });
  });

  describe('assignPlayerToClub', () => {
    test('should successfully assign player to a club', async () => {
      const playerId = 1;
      const updatePlayerDto = { club_id: 2, salary: 50000 };
      const playerDB = { id: playerId, name: 'Mario Benetto', club_id: null, email: 'mario@gmail.com' };
      const club = { id: 2, name: 'FC Barcelona', remainingBudget: 100000 };

      mockPlayerRepository.findOne.mockResolvedValue(playerDB);
      mockClubRepository.findOne.mockResolvedValue(club)
      mockPlayerRepository.update.mockResolvedValue({ ...playerDB, ...updatePlayerDto })
      mockClubRepository.update.mockResolvedValue(club);
      mockEmailService.sendEmail.mockResolvedValue(true);

      const result = await service.assignPlayerToClub(playerId, updatePlayerDto);

      expect(result.club_id).toBe(2);
      expect(result.salary).toBe(50000);
      expect(result.club_name).toBe('FC Barcelona');
      expect(mockPlayerRepository.findOne).toHaveBeenCalledWith({ where: { id: playerId } });
      expect(mockClubRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(mockPlayerRepository.update).toHaveBeenCalledWith(playerId, { salary: 50000, club_id: 2, club_name: 'FC Barcelona' });
      expect(mockClubRepository.update).toHaveBeenCalledWith(2, { remainingBudget: 50000 });
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(playerDB.email, 'added', playerDB.name, club.name);
    });

    test('should throw NotFoundException if player not found', async () => {
      const playerId = 1;
      const updatePlayerDto = { club_id: 2, salary: 50000 };

      mockPlayerRepository.findOne.mockResolvedValue(null);

      await expect(service.assignPlayerToClub(playerId, updatePlayerDto))
        .rejects
        .toThrowError(new NotFoundException(`Player with id ${playerId} not found`));

      expect(mockPlayerRepository.findOne).toHaveBeenCalledWith({ where: { id: playerId } });
    });

    test('should throw BadRequestException if player is already associated with a club', async () => {
      const playerId = 1;
      const updatePlayerDto = { club_id: 2, salary: 50000 };
      const playerDB = { id: playerId, name: 'Mario Benetto', club_id: 1, email: 'mario@gmail.com' };

      mockPlayerRepository.findOne.mockResolvedValue(playerDB);

      await expect(service.assignPlayerToClub(playerId, updatePlayerDto))
        .rejects
        .toThrowError(new BadRequestException(`Player ${playerDB.name} is already associated in a club`));

      expect(mockPlayerRepository.findOne).toHaveBeenCalledWith({ where: { id: playerId } });
    });

    test('should throw NotFoundException if club not found', async () => {
      const playerId = 1;
      const updatePlayerDto = { club_id: 2, salary: 50000 };
      const playerDB = { id: playerId, name: 'Mario Benetto', club_id: null, email: 'mario@gmail.com' };

      mockPlayerRepository.findOne.mockResolvedValue(playerDB);
      mockClubRepository.findOne.mockResolvedValue(null);

      await expect(service.assignPlayerToClub(playerId, updatePlayerDto))
        .rejects
        .toThrowError(new NotFoundException(`Club with id ${updatePlayerDto.club_id} not found`));

      expect(mockPlayerRepository.findOne).toHaveBeenCalledWith({ where: { id: playerId } });
      expect(mockClubRepository.findOne).toHaveBeenCalledWith({ where: { id: updatePlayerDto.club_id } });
    });

    test('should throw BadRequestException if club budget is insufficient', async () => {
      const playerId = 1;
      const updatePlayerDto = { club_id: 2, salary: 50000 };
      const playerDB = { id: playerId, name: 'Mario Benetto', club_id: null, email: 'mario@gmail.com' };
      const club = { id: 2, name: 'FC Barcelona', remainingBudget: 30000 };

      mockPlayerRepository.findOne.mockResolvedValue(playerDB);
      mockClubRepository.findOne.mockResolvedValue(club);

      await expect(service.assignPlayerToClub(playerId, updatePlayerDto))
        .rejects
        .toThrowError(new BadRequestException(
          `Insufficient budget in the club to hire the player. Required: ${updatePlayerDto.salary}, available: ${club.remainingBudget}`
        ));

      expect(mockPlayerRepository.findOne).toHaveBeenCalledWith({ where: { id: playerId } });
      expect(mockClubRepository.findOne).toHaveBeenCalledWith({ where: { id: updatePlayerDto.club_id } });
    });
  });

  describe("deletePlayerFromClub", () => {
    test("should successfully delete a player from a club", async () => {
      const playerId = 1;
      const playerDB = { id: playerId, name: "Mario Benetto", club_id: 2, email: "mario@gmail.com", salary: 50000 };
      const club = { id: 2, name: "FC Barcelona", remainingBudget: 100000 };

      mockPlayerRepository.findOne.mockResolvedValue(playerDB);
      mockClubRepository.findOne.mockResolvedValue(club);
      mockPlayerRepository.update.mockResolvedValue({ ...playerDB, club_id: null, club_name: null });
      mockClubRepository.update.mockResolvedValue({ ...club, remainingBudget: club.remainingBudget + playerDB.salary });
      mockEmailService.sendEmail.mockResolvedValue(true);

      await service.deletePlayerFromClub(playerId);

      expect(mockPlayerRepository.findOne).toHaveBeenCalledWith({ where: { id: playerId } });
      expect(mockClubRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(mockPlayerRepository.update).toHaveBeenCalledWith(playerId, { club_id: null, club_name: null });
      expect(mockClubRepository.update).toHaveBeenCalledWith(2, { remainingBudget: club.remainingBudget + playerDB.salary });
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(playerDB.email, "deleted", playerDB.name, club.name);
    });

    test("should throw NotFoundException if player is not found", async () => {
      const playerId = 1;
      mockPlayerRepository.findOne.mockResolvedValue(null);

      await expect(service.deletePlayerFromClub(playerId)).rejects.toThrowError(
        new NotFoundException(`Player with id ${playerId} not found`)
      );
    });

    test("should throw BadRequestException if player is not associated with a club", async () => {
      const playerId = 1;
      const playerDB = { id: playerId, name: "Mario Benetto", club_id: null, email: "mario@gmail.com", salary: 50000 };

      mockPlayerRepository.findOne.mockResolvedValue(playerDB);

      await expect(service.deletePlayerFromClub(playerId)).rejects.toThrowError(
        new BadRequestException(`Player with id: ${playerId} is not associated with a club`)
      );
    });

    test("should throw NotFoundException if club is not found", async () => {
      const playerId = 1;
      const playerDB = {
        id: playerId,
        name: "Mario Benetto",
        club_id: 2,
        email: "mario@gmail.com",
        salary: 50000,
        remainingBudget: 1000000
      };

      mockPlayerRepository.findOne.mockResolvedValue(playerDB);
      mockClubRepository.findOne.mockRejectedValue(new Error(`Club with id ${playerDB.id} not found`));

      await expect(service.deletePlayerFromClub(playerId)).rejects.toThrowError(
        new NotFoundException(`Club with id ${playerDB.id} not found`)
      );
    });
  });

  describe("deletePlayerFromClub", () => {
    test("should successfully delete a player from a club", async () => {
      const playerId = 1;
      const playerDB = { id: playerId, name: "Mario Benetto", club_id: 2, email: "mario@gmail.com", salary: 50000 };
      const club = { id: 2, name: "FC Barcelona", remainingBudget: 100000 };

      mockPlayerRepository.findOne.mockResolvedValue(playerDB);
      mockClubRepository.findOne.mockResolvedValue(club);
      mockPlayerRepository.update.mockResolvedValue({ ...playerDB, club_id: null, club_name: null });
      mockClubRepository.update.mockResolvedValue({ ...club, remainingBudget: club.remainingBudget + playerDB.salary });
      mockEmailService.sendEmail.mockResolvedValue(true);

      await service.deletePlayerFromClub(playerId);

      expect(mockPlayerRepository.findOne).toHaveBeenCalledWith({ where: { id: playerId } });
      expect(mockClubRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(mockPlayerRepository.update).toHaveBeenCalledWith(playerId, { club_id: null, club_name: null });
      expect(mockClubRepository.update).toHaveBeenCalledWith(2, { remainingBudget: club.remainingBudget + playerDB.salary });
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(playerDB.email, "deleted", playerDB.name, club.name);
    });

    test("should throw NotFoundException if player is not found", async () => {
      const playerId = 1;
      mockPlayerRepository.findOne.mockResolvedValue(null);

      await expect(service.deletePlayerFromClub(playerId)).rejects.toThrowError(
        new NotFoundException(`Player with id ${playerId} not found`)
      );
    });

    test("should throw BadRequestException if player is not associated with a club", async () => {
      const playerId = 1;
      const playerDB = { id: playerId, name: "Mario Benetto", club_id: null, email: "mario@gmail.com", salary: 50000 };

      mockPlayerRepository.findOne.mockResolvedValue(playerDB);

      await expect(service.deletePlayerFromClub(playerId)).rejects.toThrowError(
        new BadRequestException(`Player with id: ${playerId} is not associated with a club`)
      );
    });

    test("should throw NotFoundException if club is not found", async () => {
      const playerId = 1;
      const playerDB = {
        id: playerId,
        name: "Mario Benetto",
        club_id: 2,
        email: "mario@gmail.com",
        salary: 50000,
        remainingBudget: 1000000
      };

      mockPlayerRepository.findOne.mockResolvedValue(playerDB);
      mockClubRepository.findOne.mockRejectedValue(new Error(`Club with id ${playerDB.id} not found`));

      await expect(service.deletePlayerFromClub(playerId)).rejects.toThrowError(
        new NotFoundException(`Club with id ${playerDB.id} not found`)
      );
    });
  });

  describe('findAll', () => {
    test('should return a list of players', async () => {
      const result = [
        { id: 1, name: 'Player 1', email: 'player1@example.com' },
        { id: 2, name: 'Player 2', email: 'player2@example.com' },
      ];

      mockPlayerRepository.find.mockResolvedValue(result);
      const response = await service.findAll();

      expect(response).toEqual(result);
      expect(mockPlayerRepository.find).toHaveBeenCalledWith({});
    });

    test('should return an empty list when no playeres are found', async () => {
      mockPlayerRepository.find.mockResolvedValue([]);

      const response = await service.findAll();

      expect(response).toEqual([]);
      expect(mockPlayerRepository.find).toHaveBeenCalledWith({});
    });

    test('should throw an error if find method fails', async () => {
      const errorMessage = 'Database error';

      mockPlayerRepository.find.mockRejectedValue(new Error(errorMessage));

      await expect(service.findAll()).rejects.toThrowError(errorMessage);
      expect(mockPlayerRepository.find).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    test('should return a player when the player is found', async () => {
      const id = 1;
      const player = { id, name: 'Player 1', email: 'player1@example.com' };

      mockPlayerRepository.findOneBy.mockResolvedValue(player);

      const response = await service.findOne(id);

      expect(mockPlayerRepository.findOneBy).toHaveBeenCalledWith({ id });
    });

    test('should throw NotFoundException if player is not found', async () => {
      const id = 1;

      mockPlayerRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrowError(
        new NotFoundException(`Player with id ${id} not found`)
      );
      expect(mockPlayerRepository.findOneBy).toHaveBeenCalledWith({ id });
    });

    test('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      const id = 1;
      const errorMessage = 'Unexpected error searching for player';

      mockPlayerRepository.findOneBy.mockRejectedValue(new Error(errorMessage));

      await expect(service.findOne(id)).rejects.toThrowError(
        new InternalServerErrorException(`Unexpected error searching for player ${id}`)
      );
      expect(mockPlayerRepository.findOneBy).toHaveBeenCalledWith({ id });
    });
  });

  describe('getPlayersByFilter', () => {
    test('should return players filtered by club_id', async () => {
      const clubId = 1;
      const name = '';
      const page = 1;
      const limit = 10;
      const players = [
        { id: 1, name: 'Player 1', club_id: clubId },
        { id: 2, name: 'Player 2', club_id: clubId },
      ];

      mockPlayerRepository.find.mockResolvedValue(players);

      const result = await service.getPlayersByFilter(clubId, name, page, limit);

      expect(result).toEqual(players);
      expect(mockPlayerRepository.find).toHaveBeenCalledWith({
        where: { club_id: clubId },
        skip: (page - 1) * limit,
        take: limit,
      });
    });

    test('should return players filtered by club_id and name using ILike', async () => {
      const clubId = 1;
      const name = 'Player';
      const page = 1;
      const limit = 10;
      const players = [
        { id: 1, name: 'Player 1', club_id: clubId },
        { id: 2, name: 'Player 2', club_id: clubId },
      ];

      mockPlayerRepository.find.mockResolvedValue(players);

      const result = await service.getPlayersByFilter(clubId, name, page, limit);

      expect(result).toEqual(players);
      expect(mockPlayerRepository.find).toHaveBeenCalledWith({
        where: { club_id: clubId, name: ILike(`%${name}%`) },
        skip: (page - 1) * limit,
        take: limit,
      });
    });

    test('should apply pagination (skip and take) based on page and limit', async () => {
      const clubId = 1;
      const name = '';
      const page = 2;
      const limit = 5;
      const players = [
        { id: 1, name: 'Player 1', club_id: clubId },
        { id: 2, name: 'Player 2', club_id: clubId },
      ];

      mockPlayerRepository.find.mockResolvedValue(players);

      const result = await service.getPlayersByFilter(clubId, name, page, limit);

      expect(result).toEqual(players);
      expect(mockPlayerRepository.find).toHaveBeenCalledWith({
        where: { club_id: clubId },
        skip: (page - 1) * limit,
        take: limit,
      });
    });

    test('should return an empty array if no players are found', async () => {
      const clubId = 1;
      const name = '';
      const page = 1;
      const limit = 10;

      mockPlayerRepository.find.mockResolvedValue([]);

      const result = await service.getPlayersByFilter(clubId, name, page, limit);

      expect(result).toEqual([]);
      expect(mockPlayerRepository.find).toHaveBeenCalledWith({
        where: { club_id: clubId },
        skip: (page - 1) * limit,
        take: limit,
      });
    });

    test('should handle empty name and return all players filtered by club_id', async () => {
      const clubId = 1;
      const name = '';
      const page = 1;
      const limit = 10;
      const players = [
        { id: 1, name: 'Player 1', club_id: clubId },
        { id: 2, name: 'Player 2', club_id: clubId },
      ];

      mockPlayerRepository.find.mockResolvedValue(players);

      const result = await service.getPlayersByFilter(clubId, name, page, limit);

      expect(result).toEqual(players);
      expect(mockPlayerRepository.find).toHaveBeenCalledWith({
        where: { club_id: clubId },
        skip: (page - 1) * limit,
        take: limit,
      });
    });
  });

  describe('getPlayersByClubId', () => {
    test('should return players filtered by club_id', async () => {
      const clubId = 1;
      const players = [
        { id: 1, name: 'Player 1', club_id: clubId },
        { id: 2, name: 'Player 2', club_id: clubId },
      ];

      mockPlayerRepository.find.mockResolvedValue(players);

      const result = await service.getPlayersByClubId(clubId);

      expect(result).toEqual(players);
      expect(mockPlayerRepository.find).toHaveBeenCalledWith({
        where: { club_id: clubId },
      });
    });

    test('should throw an error if playerRepository.find fails', async () => {
      const clubId = 1;

      mockPlayerRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.getPlayersByClubId(clubId)).rejects.toThrowError('Error searching players by clubId');
      expect(mockPlayerRepository.find).toHaveBeenCalledWith({
        where: { club_id: clubId },
      });
    });
  });
})