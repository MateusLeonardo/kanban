import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { mockPrismaService } from 'src/prisma/prisma.service.mock';
import { ColumnService } from 'src/column/column.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Card, Column } from 'generated/prisma/client';
import { NotFoundException } from '@nestjs/common';
import { ReorderCardDto } from './dto/reorder-card-dto';

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

  describe('findAll', () => {
    it('Deve retornar todos os cards', async () => {
      const mockCards: Card[] = [
        {
          id: 1,
          name: 'Card 1',
          description: 'Descrição do Card 1',
          columnId: 1,
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Card 2',
          description: 'Descrição do Card 2',
          columnId: 1,
          position: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.card.findMany.mockResolvedValue(mockCards);

      const result = await service.findAll();

      expect(mockPrismaService.card.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockCards);
    });

    it('Deve retornar um array vazio quando não houver cards', async () => {
      mockPrismaService.card.findMany.mockResolvedValue([]);

      const result = await service.findAll();
      expect(mockPrismaService.card.findMany).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('Deve retornar um card pelo ID', async () => {
      const mockCard: Card = {
        id: 1,
        name: 'Card 1',
        description: 'Descrição do Card 1',
        columnId: 1,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.card.findUnique.mockResolvedValue(mockCard);

      const result = await service.findOne(mockCard.id);

      expect(mockPrismaService.card.findUnique).toHaveBeenCalledWith({
        where: { id: mockCard.id },
      });
      expect(result).toEqual(mockCard);
    });

    it('Deve lançar NotFoundException quando o card não for encontrado', async () => {
      mockPrismaService.card.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Card not found.'),
      );
    });
  });

  describe('reorderCard', () => {
    it('Deve reordenar os cards da mesma coluna', async () => {
      const reorderCardDto: ReorderCardDto[] = [
        { id: 1, position: 2 },
        { id: 2, position: 1 },
      ];

      const mockCards = [
        {
          id: 1,
          name: 'Card 1',
          description: 'Descrição 1',
          position: 1,
          columnId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Card 2',
          description: 'Descrição 2',
          position: 2,
          columnId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.card.findUnique
        .mockResolvedValueOnce(mockCards[0])
        .mockResolvedValueOnce(mockCards[1]);

      mockPrismaService.$transaction.mockResolvedValue([
        { ...mockCards[0], position: 2 },
        { ...mockCards[1], position: 1 },
      ]);

      await service.reorderCard(reorderCardDto);

      expect(mockPrismaService.card.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.card.findUnique).toHaveBeenNthCalledWith(1, {
        where: { id: 1 },
      });
      expect(mockPrismaService.card.findUnique).toHaveBeenNthCalledWith(2, {
        where: { id: 2 },
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('Deve reordenar os cards de colunas diferentes', async () => {
      const reorderCardDto: ReorderCardDto[] = [
        { id: 1, position: 2, columnId: 2 },
        { id: 2, position: 1, columnId: 1 },
      ];

      const mockCards = [
        {
          id: 1,
          name: 'Card 1',
          description: 'Descrição 1',
          position: 1,
          columnId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Card 2',
          description: 'Descrição 2',
          position: 2,
          columnId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockColumns = [
        {
          id: 1,
          name: 'Column 1',
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Column 2',
          position: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.card.findUnique
        .mockResolvedValueOnce(mockCards[0])
        .mockResolvedValueOnce(mockCards[1]);

      mockPrismaService.column.findUnique
        .mockResolvedValueOnce(mockColumns[1]) // columnId: 2
        .mockResolvedValueOnce(mockColumns[0]); // columnId: 1

      mockPrismaService.$transaction.mockResolvedValue([
        { ...mockCards[0], position: 2, columnId: 2 },
        { ...mockCards[1], position: 1, columnId: 1 },
      ]);

      await service.reorderCard(reorderCardDto);

      expect(mockPrismaService.card.findUnique).toHaveBeenCalledTimes(2);

      expect(mockPrismaService.column.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.column.findUnique).toHaveBeenNthCalledWith(1, {
        where: { id: 2 },
      });
      expect(mockPrismaService.column.findUnique).toHaveBeenNthCalledWith(2, {
        where: { id: 1 },
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
