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
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  productName: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => +value)
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => +value)
  @IsPositive()
  price: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  category: string;
}
