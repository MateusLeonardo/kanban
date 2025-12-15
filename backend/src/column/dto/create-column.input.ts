import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateColumnInput {
  @Field(() => String, { description: 'Name of the column' })
  name: string;

  @Field(() => Int, { description: 'Position of the column' })
  position: number;
}
