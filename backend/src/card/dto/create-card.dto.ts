import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  columnId: number;

  @IsInt()
  @IsOptional()
  position?: number;
}
