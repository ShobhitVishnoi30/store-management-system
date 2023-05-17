import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCartItemDto {
  /**
   * Item id
   */
  @ApiProperty({
    required: true,
    description: 'id of the item',
  })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  /**
   *quantity of the item
   */
  @ApiProperty({
    required: true,
    description: 'quantity of the item',
  })
  @IsNotEmpty()
  quantity: number;
}
