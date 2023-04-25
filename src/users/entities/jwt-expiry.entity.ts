import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
@Index(['jwtToken'], { unique: true })
export class JWTExpiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  jwtToken: string;

  @Column()
  status: boolean;
}
