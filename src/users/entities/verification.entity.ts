import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
@Index(['userName'], { unique: true })
export class Verifications {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  verificationHash: string;

  @Column()
  expirationTime: string;
}
