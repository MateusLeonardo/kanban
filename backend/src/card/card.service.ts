import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ColumnService } from 'src/column/column.service';
import { ReorderCardDto } from './dto/reorder-card-dto';

@Injectable()
export class CardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly columnService: ColumnService,
  ) {}

  async create(createCardDto: CreateCardDto) {
    await this.columnService.findOne(createCardDto.columnId);
    const lastCard = await this.prisma.card.findFirst({
      orderBy: {
        position: 'desc',
      },
    });
    const position = (lastCard?.position ?? 0) + 1;
    return this.prisma.card.create({
      data: {
        ...createCardDto,
        position,
      },
    });
  }

  findAll() {
    return this.prisma.card.findMany({
      orderBy: {
        position: 'asc',
      },
    });
  }

  async reorderCard(reorderCardDto: ReorderCardDto[]) {
    await Promise.all(
      reorderCardDto.map(async (dto) => {
        await this.prisma.card.update({
          where: {
            id: dto.id,
          },
          data: {
            position: dto.position,
            ...(dto.columnId !== undefined && { columnId: dto.columnId }),
          },
        });
      }),
    );
  }

  async findOne(id: number) {
    const card = await this.prisma.card.findUnique({
      where: {
        id,
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }
    return card;
  }

  async update(id: number, updateCardDto: UpdateCardDto) {
    await this.columnService.findOne(updateCardDto.columnId);
    await this.findOne(id);
    return this.prisma.card.update({
      where: {
        id,
      },
      data: {
        ...updateCardDto,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.card.delete({
      where: {
        id,
      },
    });
  }
}
