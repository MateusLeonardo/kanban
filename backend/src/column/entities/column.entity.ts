import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Column {
  @Field(() => Int, { description: 'ID of the column' })
  id: number;

  @Field(() => String, { description: 'Name of the column' })
  name: string;

  @Field(() => Int, { description: 'Position of the column' })
  position: number;

  @Field(() => Date, { description: 'Date of creation of the column' })
  createdAt: Date;

  @Field(() => Date, { description: 'Date of update of the column' })
  updatedAt: Date;
}
