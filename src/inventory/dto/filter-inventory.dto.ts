import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { InventoryDto } from './create-inventory.dto';
import { ApiProperty } from '@nestjs/swagger';

export enum SortingOptions {
  PRICE = 'price',
  QUANTITY = 'quantity',
}

export enum Direction {
  EQUALORLESS = 'less',
  EQUALORMORE = 'more',
}

export class FilterInventoryDto extends PartialType(InventoryDto) {
  /**
   * Sorting option
   */
  @ApiProperty({
    required: true,
    description: 'sorting option by price or by quantity',
  })
  @IsOptional()
  @IsEnum(SortingOptions)
  sortBy: SortingOptions;

  /**
   * Sorting direction
   */
  @ApiProperty({
    required: true,
    description: 'sort direction ',
  })
  @IsOptional()
  @IsEnum(Direction)
  sortDirection: Direction;

  /**
   *
   */
  @ApiProperty({
    required: true,
    description: 'order by',
  })
  @Transform(({ value }) => Boolean(value))
  @IsOptional()
  @IsBoolean()
  orderBy = false;
}
