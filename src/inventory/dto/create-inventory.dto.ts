import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class InventoryDto {
  /**
   * Product name
   */
  @ApiProperty({ required: true, description: 'name of the product' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  productName: string;

  /**
   * Quantity of the product
   */
  @ApiProperty({ required: true, description: 'quantity of the product' })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => +value)
  @IsPositive()
  quantity: number;

  /**
   * Price of the product
   */
  @ApiProperty({ required: true, description: 'price of the product' })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => +value)
  @IsPositive()
  price: number;

  /**
   * category of the product
   */
  @ApiProperty({ required: true, description: 'category of the product' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  category: string;
}
