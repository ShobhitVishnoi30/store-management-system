import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCartItemDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsNotEmpty()
  quantity: number;
}
