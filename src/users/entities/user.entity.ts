import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
@Index(['userName'], { unique: true })
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  password: string;

  @Column()
  phoneNumber: string;

  @Column({ default: false })
  verifiedEmail: boolean;

  @Column({ default: false })
  verifiedPhoneNumber: boolean;

  @Column()
  role: Role;
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}
