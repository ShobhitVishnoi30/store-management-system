import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productName: string;

  @Column('integer')
  quantity: number;

  @Column('decimal')
  price: number;

  @Column()
  category: string;
}
