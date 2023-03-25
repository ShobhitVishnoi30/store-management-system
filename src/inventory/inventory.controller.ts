import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InventoryDto } from 'src/inventory/dto/create-inventory.dto';
import { FilterInventoryDto } from 'src/inventory/dto/filter-inventory.dto';
import { UpdateInventoryDto } from 'src/inventory/dto/update-inventory.dto';
import { InventoryService } from './inventory.service';
import { ApiResponse } from 'src/interfaces/api-response.interface';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async insertProduct(
    @Body() inventoryDto: InventoryDto,
  ): Promise<ApiResponse> {
    return await this.inventoryService.insertProduct(inventoryDto);
  }

  @Get()
  async getAllInventory(): Promise<ApiResponse> {
    return await this.inventoryService.getAllInventory();
  }

  //put filter in query
  @Get('filter')
  async filterInventory(
    @Query() filterInventoryDto: FilterInventoryDto,
  ): Promise<ApiResponse> {
    return await this.inventoryService.filteredInventory(filterInventoryDto);
  }

  @Get(':id')
  async getInventoryById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse> {
    return await this.inventoryService.getInventoryById(id);
  }

  @Patch(':id')
  async updateInventory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ): Promise<ApiResponse> {
    return await this.inventoryService.updateInventory(id, updateInventoryDto);
  }

  @Delete(':id')
  async deleteInventory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse> {
    return await this.inventoryService.deleteInventory(id);
  }
}
