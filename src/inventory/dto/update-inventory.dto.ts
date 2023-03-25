import { InventoryDto } from './create-inventory.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateInventoryDto extends PartialType(InventoryDto) {}
