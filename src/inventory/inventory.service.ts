import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryDto } from 'src/inventory/dto/create-inventory.dto';
import {
  Direction,
  FilterInventoryDto,
} from 'src/inventory/dto/filter-inventory.dto';
import { UpdateInventoryDto } from 'src/inventory/dto/update-inventory.dto';
import { Inventory } from 'src/inventory/entity/inventory.entity';
import { ApiResponse } from 'src/interfaces/api-response.interface';
import { ResponseHandlerService } from 'src/utilities/response-handler.service';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly responseHandlerService: ResponseHandlerService,
  ) {}

  async insertProduct(inventoryDto: InventoryDto): Promise<ApiResponse> {
    try {
      let inventory = this.inventoryRepository.create(inventoryDto);

      inventory = await this.inventoryRepository.save(inventory);

      return await this.responseHandlerService.response(
        '',
        HttpStatus.OK,
        'Inventory added statusfully',
        inventory,
      );
    } catch (e) {
      return await this.responseHandlerService.response(
        e.message,
        HttpStatus.BAD_REQUEST,
        'Inventory not added',
        '',
      );
    }
  }

  async getAllInventory(): Promise<ApiResponse> {
    const inventories = await this.inventoryRepository.find();
    if (inventories.length != 0) {
      return this.responseHandlerService.response(
        null,
        HttpStatus.OK,
        'Inventory fetched successfully',
        inventories,
      );
    } else {
      return this.responseHandlerService.response(
        null,
        HttpStatus.NO_CONTENT,
        'No inventory found',
        inventories,
      );
    }
  }

  async getInventoryById(id: string): Promise<ApiResponse> {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        id,
      },
    });
    if (inventory) {
      return this.responseHandlerService.response(
        null,
        HttpStatus.OK,
        'Inventory fetched successfully',
        inventory,
      );
    } else {
      return this.responseHandlerService.response(
        null,
        HttpStatus.NO_CONTENT,
        'no such inventory exists',
        inventory,
      );
    }
  }

  async updateInventory(
    id: string,
    updateInventory: UpdateInventoryDto,
  ): Promise<ApiResponse> {
    let inventory = await this.inventoryRepository.findOneBy({ id });

    if (inventory) {
      Object.keys(updateInventory).forEach((key) => {
        if (updateInventory[key]) {
          return (inventory[key] = updateInventory[key]);
        }
      });
      try {
        inventory = await this.inventoryRepository.save(inventory);
        return this.responseHandlerService.response(
          null,
          HttpStatus.OK,
          'Inventory updated successfully',
          inventory,
        );
      } catch (e) {
        return this.responseHandlerService.response(
          e.message,
          HttpStatus.BAD_REQUEST,
          'Inventory not updated',
          '',
        );
      }
    } else {
      return this.responseHandlerService.response(
        null,
        HttpStatus.NO_CONTENT,
        'no such inventory exists',
        inventory,
      );
    }
  }

  async deleteInventory(id: string): Promise<ApiResponse> {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        id,
      },
    });

    if (inventory) {
      await this.inventoryRepository.delete(id);
      return this.responseHandlerService.response(
        null,
        HttpStatus.OK,
        'Inventory deleted successfully',
        inventory,
      );
    } else {
      return this.responseHandlerService.response(
        null,
        HttpStatus.NO_CONTENT,
        'No such product found',
        inventory,
      );
    }
  }

  async filteredInventory(
    filterInventoryDto: FilterInventoryDto,
  ): Promise<ApiResponse> {
    let where = {};
    let ordersBy = {};
    let inventory: Inventory[];

    const {
      productName,
      category,
      price,
      quantity,
      sortBy,
      sortDirection,
      orderBy,
    } = filterInventoryDto;

    if (productName) {
      where['productName'] = productName;
    }
    if (quantity && sortDirection) {
      if (sortDirection.toLowerCase() == Direction.EQUALORMORE) {
        where['quantity'] = MoreThanOrEqual(quantity);
      } else {
        where['quantity'] = LessThanOrEqual(quantity);
      }
    }
    if (price && sortDirection) {
      if (sortDirection.toLowerCase() == Direction.EQUALORLESS) {
        where['price'] = MoreThanOrEqual(price);
      } else {
        where['price'] = LessThanOrEqual(price);
      }
    }
    if (category) {
      where['category'] = category;
    }
    if (sortBy) {
      ordersBy[sortBy] = orderBy ? 'ASC' : 'DESC';
    }

    inventory = await this.inventoryRepository.find({ where, order: ordersBy });

    if (inventory.length != 0) {
      return this.responseHandlerService.response(
        null,
        HttpStatus.OK,
        'Filtered inventory fetched successfully',
        inventory,
      );
    } else {
      return this.responseHandlerService.response(
        null,
        HttpStatus.NO_CONTENT,
        'No product found in the inventory',
        inventory,
      );
    }
  }
}
