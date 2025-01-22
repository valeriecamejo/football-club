import { Test, TestingModule } from '@nestjs/testing';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';

describe('CoachController', () => {
  let controller: CoachController;
  let service: CoachService;

  const mockCoachService = {
    assignCoachToClub: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    deleteCoachFromClub: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoachController],
      providers: [
        {
          provide: CoachService,
          useValue: mockCoachService,
        },
      ],
    }).compile();

    controller = module.get<CoachController>(CoachController);
    service = module.get<CoachService>(CoachService);
  });

  test('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    test('should successfully create a coach', async () => {
      const createCoachDto: CreateCoachDto = { name: 'John Doe', email: 'john.doe@example.com' };
      const result = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };

      mockCoachService.create.mockResolvedValue(result);

      const response = await controller.create(createCoachDto);

      expect(response).toEqual(result);
      expect(mockCoachService.create).toHaveBeenCalledWith(createCoachDto);
    });
  });

  describe('findAll', () => {
    test('should return all coaches', async () => {
      const coaches = [
        { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
        { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com' },
      ];

      mockCoachService.findAll.mockResolvedValue(coaches);

      const response = await controller.findAll();

      expect(response).toEqual(coaches);
      expect(mockCoachService.findAll).toHaveBeenCalled();
    });
  });

  describe('assignCoachToClub', () => {
    test('should successfully assign a coach to a club', async () => {
      const coachId = 1;
      const updateCoachDto: UpdateCoachDto = { club_id: 2, salary: 50000 };
      const result = { id: coachId, club_id: 2, salary: 50000, name: 'John Doe', email: 'john.doe@example.com' };

      mockCoachService.assignCoachToClub.mockResolvedValue(result);

      const response = await controller.assignCoachToClub(coachId, updateCoachDto);

      expect(response).toEqual(result);
      expect(mockCoachService.assignCoachToClub).toHaveBeenCalledWith(coachId, updateCoachDto);
    });
  });

  describe('deleteCoachFromClub', () => {
    test('should successfully delete a coach from a club', async () => {
      const coachId = 1;
      const result = { id: coachId, name: 'John Doe', email: 'john.doe@example.com', club_id: null };

      mockCoachService.deleteCoachFromClub.mockResolvedValue(result);

      const response = await controller.deleteCoachFromClub(coachId);

      expect(response).toEqual(result);
      expect(mockCoachService.deleteCoachFromClub).toHaveBeenCalledWith(coachId);
    });
  });
});