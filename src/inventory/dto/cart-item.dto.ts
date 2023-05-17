import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CartItemDto {
  /**
   * Item id
   */
  @ApiProperty({ required: true, description: 'id of the item' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  /**
   * Quantity of the item
   */
  @ApiProperty({ required: true, description: 'quantity of the item' })
  @IsNotEmpty()
  quantity: number;
}
