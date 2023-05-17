import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  /**
   * new password of user
   */
  @ApiProperty({ required: true, description: 'password of the user' })
  @IsEmpty({ message: 'Password should not be provided' })
  password: string;
}
