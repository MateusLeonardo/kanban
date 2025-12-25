import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { mockPrismaService } from 'src/prisma/prisma.service.mock';
import { ColumnService } from 'src/column/column.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Card, Column } from 'generated/prisma/client';

describe('CardService', () => {
  let service: CardService;
  let prisma: PrismaService;
  let columnService: ColumnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        ColumnService,
      ],
    }).compile();

    service = module.get<CardService>(CardService);
    prisma = module.get<PrismaService>(PrismaService);
    columnService = module.get<ColumnService>(ColumnService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('Deve criar um card com a posição 1 quando não existirem cards na coluna', async () => {
      const createCardDto: CreateCardDto = {
        name: 'Novo Card',
        description: 'Descrição do novo card',
        columnId: 1,
      };

      const mockColumn: Column = {
        id: 1,
        name: 'To Do',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCard: Card = {
        id: 1,
        name: createCardDto.name,
        description: createCardDto.description ?? '',
        columnId: createCardDto.columnId,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(columnService, 'findOne').mockResolvedValue(mockColumn);
      mockPrismaService.card.findFirst.mockResolvedValue(null);
      mockPrismaService.card.create.mockResolvedValue(mockCard);

      const result = await service.create(createCardDto);

      expect(columnService.findOne).toHaveBeenCalledWith(
        createCardDto.columnId,
      );
      expect(mockPrismaService.card.findFirst).toHaveBeenCalledWith({
        orderBy: { position: 'desc' },
      });
      expect(mockPrismaService.card.create).toHaveBeenCalledWith({
        data: {
          ...createCardDto,
          position: 1,
        },
      });
      expect(result).toEqual(mockCard);
    });

    it('Deve criar um card com posição incrementada quando já existem cards na coluna', async () => {
      const createCardDto: CreateCardDto = {
        name: 'Segundo Card',
        description: 'Descrição do segundo card',
        columnId: 1,
      };

      const mockColumn: Column = {
        id: 1,
        name: 'To Do',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingCard: Card = {
        id: 1,
        name: 'Card Existente',
        description: 'Descrição',
        columnId: 1,
        position: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCard: Card = {
        id: 2,
        name: createCardDto.name,
        description: createCardDto.description ?? '',
        columnId: createCardDto.columnId,
        position: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(columnService, 'findOne').mockResolvedValue(mockColumn);
      mockPrismaService.card.findFirst.mockResolvedValue(existingCard);
      mockPrismaService.card.create.mockResolvedValue(mockCard);

      const result = await service.create(createCardDto);

      expect(columnService.findOne).toHaveBeenCalledWith(
        createCardDto.columnId,
      );
      expect(mockPrismaService.card.findFirst).toHaveBeenCalledWith({
        orderBy: { position: 'desc' },
      });
      expect(mockPrismaService.card.create).toHaveBeenCalledWith({
        data: {
          ...createCardDto,
          position: 3,
        },
      });
      expect(result).toEqual(mockCard);
    });
  });
});
