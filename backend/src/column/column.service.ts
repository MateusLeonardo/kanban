import { Injectable } from '@nestjs/common';
import { CreateColumnInput } from './dto/create-column.input';
import { UpdateColumnInput } from './dto/update-column.input';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ColumnService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(data: CreateColumnInput) {
    const lastComunPosition = await this.prismaService.column.findFirst({
      orderBy: {
        position: 'desc',
      },
    });
    const newPosition = (lastComunPosition?.position || 0) + 1;
    return this.prismaService.column.create({
      data: {
        ...data,
        position: newPosition,
      },
    });
  }

  findAll() {
    return this.prismaService.column.findMany({
      orderBy: {
        position: 'asc',
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.column.findUnique({
      where: { id },
    });
  }

  update(id: number, data: UpdateColumnInput) {
    return this.prismaService.column.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prismaService.column.delete({
      where: { id },
    });
  }
}
