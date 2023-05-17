import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Req() req) {
    return this.usersService.login(req.user);
  }

  @Get('forgot-password')
  forgotPassword(@Req() req) {
    return this.usersService.forgotPassword(req.query.userName);
  }

  @Get('google-auth')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    return this.usersService.googleLogin(req);
  }

  @Get('send-otp')
  sendOtp(@Req() req) {
    return this.usersService.sendOTP(req.body.userName);
  }

  @Post('update-password')
  async updatePassword(@Body() forgotPassword: ForgotPasswordDto) {
    return this.usersService.resetPassword(forgotPassword);
  }

  @Post('send-verification-email')
  sendVerificationEmail(@Req() req) {
    return this.usersService.sendLinkForEmail(req.query.userName);
  }

  @Post('verify-email')
  verifyEmail(@Req() req) {
    return this.usersService.verifyEmail(
      req.query.userName,
      req.query.verification,
    );
  }

  @Post('verify-otp')
  verifyOTP(@Req() req) {
    return this.usersService.verifyOTP(req.body.userName, req.body.otp);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logOut(@Req() req) {
    return this.usersService.logOut(
      req.user,
      req.headers.authorization.split(' ')[1],
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.getProfile(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(req.user, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  deleteUser(@Req() req) {
    return this.usersService.deleteUser(req.user);
  }
}
