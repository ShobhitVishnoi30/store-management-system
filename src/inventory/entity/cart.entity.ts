import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    cascade: true,
    eager: true,
  })
  cartItems: CartItem[];

  @Column('decimal')
  totalPrice: number;

  @Column()
  createdDate: string;

  @Column()
  modifiedDate: string;

  @Column({ default: false })
  bought: boolean;
}
