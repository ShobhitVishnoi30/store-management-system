import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Req,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Req() req) {
    return this.usersService.login(req.user);
  }

  @Get('google-auth')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google-auth-redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.usersService.googleLogin(req);
  }

  @Get('send-otp')
  sendOtp(@Req() req) {
    return this.usersService.sendOTP(req.body.userName);
  }

  @Post('verify-otp')
  verifyOTP(@Req() req) {
    return this.usersService.verifyOTP(req.body.userName, req.body.otp);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(req.user, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logOut(@Req() req) {
    return this.usersService.logOut(
      req.user,
      req.headers.authorization.split(' ')[1],
    );
  }
}
