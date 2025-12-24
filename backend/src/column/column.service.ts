import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { PrismaService } from '../prisma/prisma.service';
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

  findAllWithCards() {
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
      throw new NotFoundException('A coluna não existe.');
    }
    return column;
  }

  async reorderColumn(reorderColumnDto: ReorderColumnDto[]) {
    const ids = reorderColumnDto.map((dto) => dto.id);
    const positions = reorderColumnDto.map((dto) => dto.position);

    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Ids duplicados não são permitidos.');
    }

    if (new Set(positions).size !== positions.length) {
      throw new BadRequestException('Posições duplicadas não são permitidos.');
    }

    await Promise.all(ids.map((id) => this.findOne(id)));

    await this.prisma.$transaction(
      reorderColumnDto.map((dto) =>
        this.prisma.column.update({
          where: { id: dto.id },
          data: { position: dto.position },
        }),
      ),
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
