import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ColumnService } from './column.service';
import { Column } from './entities/column.entity';
import { CreateColumnInput } from './dto/create-column.input';
import { UpdateColumnInput } from './dto/update-column.input';

@Resolver(() => Column)
export class ColumnResolver {
  constructor(private readonly columnService: ColumnService) {}

  @Mutation(() => Column)
  createColumn(@Args('data') createColumnInput: CreateColumnInput) {
    return this.columnService.create(createColumnInput);
  }

  @Query(() => [Column], { name: 'column' })
  findAll() {
    return this.columnService.findAll();
  }

  @Query(() => Column, { name: 'column' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.columnService.findOne(id);
  }

  @Mutation(() => Column)
  updateColumn(@Args('data') updateColumnInput: UpdateColumnInput) {
    return this.columnService.update(updateColumnInput.id, updateColumnInput);
  }

  @Mutation(() => Column)
  removeColumn(@Args('id', { type: () => Int }) id: number) {
    return this.columnService.remove(id);
  }
}
