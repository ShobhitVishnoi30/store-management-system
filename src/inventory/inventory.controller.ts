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
  Req,
  UseGuards,
} from '@nestjs/common';
import { InventoryDto } from 'src/inventory/dto/create-inventory.dto';
import { FilterInventoryDto } from 'src/inventory/dto/filter-inventory.dto';
import { UpdateInventoryDto } from 'src/inventory/dto/update-inventory.dto';
import { InventoryService } from './inventory.service';
import { ApiResponse } from 'src/interfaces/api-response.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/users/entities/user.entity';
import { CartItemDto } from './dto/cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async updateInventory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ): Promise<ApiResponse> {
    return await this.inventoryService.updateInventory(id, updateInventoryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteInventory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse> {
    return await this.inventoryService.deleteInventory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/addToCart')
  async addToCart(@Req() req, @Body() cartItemDto: CartItemDto) {
    return await this.inventoryService.addToCart(req.user, cartItemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/removeFromCart')
  async removeFromCart(@Req() req, @Body() updatedCartItem: UpdateCartItemDto) {
    return await this.inventoryService.removeItemFromCart(
      req.user,
      updatedCartItem,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/buy/:id')
  async buyItems(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    return await this.inventoryService.buyItems(req.user, id);
  }
}
