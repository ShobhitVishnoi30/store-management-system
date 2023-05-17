import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  /**
   * userName of user
   */
  @ApiProperty({ required: true, description: 'UserName for the user' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  userName: string;

  /**
   * password of user
   */
  @ApiProperty({ required: true, description: 'passowrd of user' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*()_+])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  /**
   * Phone Number of user
   */
  @ApiProperty({ required: true, description: 'Phone number of user' })
  @IsNotEmpty()
  @IsPhoneNumber(null, {
    message: 'Invalid phone number. Please provide a valid phone number.',
  })
  phoneNumber: string;
}
