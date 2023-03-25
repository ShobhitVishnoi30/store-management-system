import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsBooleanString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { InventoryDto } from './create-inventory.dto';

export enum SortingOptions {
  PRICE = 'price',
  QUANTITY = 'quantity',
}

export enum Direction {
  EQUALORLESS = 'less',
  EQUALORMORE = 'more',
}

export class FilterInventoryDto extends PartialType(InventoryDto) {
  @IsOptional()
  @IsEnum(SortingOptions)
  sortBy: SortingOptions;

  @IsOptional()
  @IsEnum(Direction)
  sortDirection: Direction;

  @Transform(({ value }) => Boolean(value))
  @IsOptional()
  @IsBoolean()
  orderBy: Boolean = false;
}
