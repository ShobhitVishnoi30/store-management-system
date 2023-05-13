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
import { CartItemDto } from './dto/cart-item.dto';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { UpdateCartItemDto } from './dto/update-cart.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
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

  async addToCart(user: any, cartItemDto: CartItemDto) {
    try {
      let cart = await this.cartRepository.findOne({
        where: {
          userId: user.userId,
        },
      });

      if (!cart) {
        cart = this.cartRepository.create();
        cart.createdDate = Date.now().toString();
      }

      let itemDetials = await this.inventoryRepository.findOne({
        where: {
          id: cartItemDto.itemId,
        },
      });

      cart.userId = user.userId;

      let cartItem = this.cartItemRepository.create();
      cartItem.cart = cart;
      cartItem.itemId = cartItemDto.itemId;
      cartItem.quantity = cartItemDto.quantity;
      cartItem.price = itemDetials.price;

      if (!cart.cartItems) {
        cart.cartItems = [cartItem];
      } else {
        const existingCartItem = cart.cartItems.find(
          (item) => item.itemId.toLowerCase() === cartItem.itemId.toLowerCase(),
        );

        if (existingCartItem) {
          existingCartItem.quantity += cartItemDto.quantity;
        } else {
          cart.cartItems.push(cartItem);
        }
      }

      cart.modifiedDate = Date.now().toString();

      let totalCost = Number(cartItemDto.quantity) * Number(itemDetials.price);
      if (!cart.totalPrice) {
        cart.totalPrice = totalCost;
      } else {
        cart.totalPrice = Number(cart.totalPrice) + totalCost;
      }

      await this.cartRepository.save(cart);
      return await this.responseHandlerService.response(
        null,
        HttpStatus.OK,
        'Cart Updated',
        cart.id,
      );
    } catch (error) {
      return await this.responseHandlerService.response(
        error.message,
        HttpStatus.BAD_REQUEST,
        'Something went wrong',
        '',
      );
    }
  }

  async removeItemFromCart(user: any, updatedCartItem: UpdateCartItemDto) {
    try {
      let cart = await this.cartRepository.findOne({
        where: {
          userId: user.userId,
        },
      });
      if (!cart) {
        throw new Error('No cart for this user');
      }
      let itemDetails = await this.inventoryRepository.findOne({
        where: {
          id: updatedCartItem.itemId,
        },
      });

      const existingCartItem = cart.cartItems.find(
        (item) =>
          item.itemId.toLowerCase() === updatedCartItem.itemId.toLowerCase(),
      );

      if (existingCartItem) {
        if (existingCartItem.quantity >= updatedCartItem.quantity) {
          existingCartItem.quantity -= updatedCartItem.quantity;
          if (existingCartItem.quantity == 0) {
            cart.cartItems = cart.cartItems.filter(
              (cartItem) => cartItem.id !== existingCartItem.id,
            );
            await this.cartItemRepository.delete(existingCartItem.id);
          }
        } else {
          throw new Error('less number of items');
        }
      } else {
        throw new Error('No such item on this cart');
      }

      cart.modifiedDate = Date.now().toString();

      let totalCost =
        Number(updatedCartItem.quantity) * Number(itemDetails.price);

      cart.totalPrice = Number(cart.totalPrice) - totalCost;

      if (cart.cartItems.length == 0) {
        await this.cartRepository.remove(cart);
      } else {
        await this.cartRepository.save(cart);
      }

      return await this.responseHandlerService.response(
        null,
        HttpStatus.OK,
        'cart updated successfully',
        cart.id,
      );
    } catch (error) {
      return await this.responseHandlerService.response(
        error.message,
        HttpStatus.BAD_REQUEST,
        'Something went wrong',
        '',
      );
    }
  }

  async buyItems(user: any, id: string) {
    try {
      let cart = await this.cartRepository.findOne({
        where: {
          id,
        },
      });

      if (!cart) {
        throw new Error('cart not found');
      }
      if (cart.bought) {
        throw new Error('already bought');
      }

      cart.bought = true;
      await this.cartRepository.save(cart);
      return await this.responseHandlerService.response(
        null,
        HttpStatus.OK,
        'succesfully purchased',
        cart.id,
      );
    } catch (error) {
      return await this.responseHandlerService.response(
        error.message,
        HttpStatus.BAD_REQUEST,
        'invalid cart id',
        '',
      );
    }
  }
}
