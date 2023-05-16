import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/inventory/entity/inventory.entity';
import { ResponseHandlerService } from 'src/utilities/response-handler.service';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Verifications } from 'src/users/entities/verification.entity';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Verifications, Inventory, Cart, CartItem]),
  ],
  providers: [InventoryService, ResponseHandlerService],
  controllers: [InventoryController],
})
export class InventoryModule {}
