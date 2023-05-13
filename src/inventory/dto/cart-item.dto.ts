import { IsNotEmpty, IsString } from 'class-validator';

export class CartItemDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsNotEmpty()
  quantity: number;
}
