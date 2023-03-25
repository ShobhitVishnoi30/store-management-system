import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/inventory/entity/inventory.entity';
import { ResponseHandlerService } from 'src/utilities/response-handler.service';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory])],
  providers: [InventoryService, ResponseHandlerService],
  controllers: [InventoryController],
})
export class InventoryModule {}
