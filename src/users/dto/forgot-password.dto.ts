import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ForgotPasswordDto {
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
   * Password user wants as new password
   */
  @ApiProperty({
    required: true,
    description: 'Password user wants as new password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'password must contain minimum of 8 characters' })
  @MaxLength(32, { message: 'password must contain maximum of 32 characters' })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Weak Password',
  })
  password: string;

  /**
   * Must be same as password field
   */
  @ApiProperty({
    required: true,
    description: 'Must be same as password field',
  })
  @IsNotEmpty()
  @IsString()
  passwordConfirm: string;

  /**
   * OTP for resetting the password
   */
  @ApiProperty({
    required: true,
    description: 'Must provide OTP',
  })
  @IsNotEmpty()
  OTP: number;
}
