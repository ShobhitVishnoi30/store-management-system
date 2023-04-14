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

  @Column()
  verifiedPhoneNumber: Boolean;

  @Column()
  role: Role;

  @Column()
  revokedTokens: string;
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}
