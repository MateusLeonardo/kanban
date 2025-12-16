import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReorderColumnDto } from './dto/reorder-column.dto';

@Injectable()
export class ColumnService {
  constructor(private prisma: PrismaService) {}

  async create(createColumnDto: CreateColumnDto) {
    const lastColumn = await this.prisma.column.findFirst({
      orderBy: {
        position: 'desc',
      },
    });
    const position = (lastColumn?.position ?? 0) + 1;
    return this.prisma.column.create({
      data: {
        ...createColumnDto,
        position,
      },
    });
  }

  findAll() {
    return this.prisma.column.findMany({
      orderBy: {
        position: 'asc',
      },
      include: {
        cards: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const column = await this.prisma.column.findUnique({
      where: {
        id,
      },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }
    return column;
  }
  async reorderColumn(reorderColumnDto: ReorderColumnDto[]) {
    await Promise.all(
      reorderColumnDto.map(async (dto) => {
        await this.prisma.column.update({
          where: {
            id: dto.id,
          },
          data: {
            position: dto.position,
          },
        });
      }),
    );
  }

  async update(id: number, updateColumnDto: UpdateColumnDto) {
    await this.findOne(id);
    return this.prisma.column.update({
      where: {
        id,
      },
      data: updateColumnDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.column.delete({
      where: {
        id,
      },
    });
  }
}
