import {
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ResponseHandlerService } from 'src/utilities/response-handler.service';
import { Role, Users } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { TwilioService } from 'nestjs-twilio';

@Injectable()
export class UsersService implements OnModuleInit {
  async onModuleInit() {
    let adminDetails = {
      userName: 'admin@login',
      password: process.env.ADMIN_PASSWORD,
      phoneNumber: '',
      verifiedPhoneNumber: false,
      role: Role.ADMIN,
      revokedTokens: '',
    };

    const admin = await this.userRepository.findOne({
      where: {
        userName: adminDetails.userName,
      },
    });

    if (!admin) {
      adminDetails.password = await bcrypt.hash(
        adminDetails.password,
        +process.env.SALT_ROUNDS,
      );
      await this.userRepository.save(adminDetails);
    }
  }

  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly responseHandlerService: ResponseHandlerService,
    private jwtService: JwtService,
    private readonly twilioService: TwilioService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        +process.env.SALT_ROUNDS,
      );

      createUserDto.userName = createUserDto.userName.toLowerCase();

      let user = this.userRepository.create(createUserDto);

      user.revokedTokens = '';
      user.verifiedPhoneNumber = false;
      user.role = Role.USER;

      user = await this.userRepository.save(user);

      return await this.responseHandlerService.response(
        '',
        HttpStatus.OK,
        'user added statusfully',
        user.userName,
      );
    } catch (e) {
      return await this.responseHandlerService.response(
        e.message,
        HttpStatus.BAD_REQUEST,
        'user not added',
        '',
      );
    }
  }

  async getProfile(user: any) {
    if (user.message) {
      return await this.responseHandlerService.response(
        user.message,
        HttpStatus.FORBIDDEN,
        '',
        '',
      );
    }
    return await this.responseHandlerService.response(
      '',
      HttpStatus.OK,
      'user profile fetched successfully',
      user,
    );
  }

  async findOne(username: string): Promise<Users | undefined> {
    const user = await this.userRepository.findOne({
      where: {
        userName: username,
      },
    });

    return user;
  }

  async findById(id: string): Promise<Users | undefined> {
    return await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async login(user: any) {
    const payload = { userId: user.id, username: user.userName };
    const accessToken = { accessToken: this.jwtService.sign(payload) };
    return await this.responseHandlerService.response(
      '',
      HttpStatus.OK,
      'user logged in successfully',
      accessToken,
    );
  }

  async updateUser(userData: any, updateUserDto: UpdateUserDto) {
    if (userData.message) {
      return await this.responseHandlerService.response(
        userData.message,
        HttpStatus.FORBIDDEN,
        '',
        '',
      );
    }
    try {
      const user = await this.findById(userData.userId);
      const { userName, password, phoneNumber } = updateUserDto;

      const updatedUser: Users = {
        ...user,
        ...(updateUserDto.userName && { userName: updateUserDto.userName }),
        ...(updateUserDto.password && {
          password: await bcrypt.hash(
            updateUserDto.password,
            +process.env.SALT_ROUNDS,
          ),
        }),
        ...(updateUserDto.phoneNumber && {
          phoneNumber: updateUserDto.phoneNumber,
        }),
      };
      if (phoneNumber) {
        updatedUser.verifiedPhoneNumber = false;
      }

      await this.userRepository.save(updatedUser);

      return await this.responseHandlerService.response(
        '',
        HttpStatus.OK,
        'user successfully updated',
        userName,
      );
    } catch (error) {
      return await this.responseHandlerService.response(
        error.message,
        HttpStatus.SERVICE_UNAVAILABLE,
        '',
        '',
      );
    }
  }

  async logOut(userData: any, token: string) {
    if (userData.message) {
      return await this.responseHandlerService.response(
        userData.message,
        HttpStatus.FORBIDDEN,
        '',
        '',
      );
    }

    const user = await this.findById(userData.userId);

    user.revokedTokens = token;

    await this.userRepository.save(user);

    return await this.responseHandlerService.response(
      '',
      HttpStatus.OK,
      'user logged out successfully',
      userData.userName,
    );
  }

  async sendOTP(userName: string) {
    try {
      const user = await this.findOne(userName);
      if (user.verifiedPhoneNumber) {
        throw new Error('already verified');
      }
      const otpResponse = await this.twilioService.client.verify
        .services(process.env.TWILIO_SERVICE_SID)
        .verifications.create({
          to: user.phoneNumber,
          channel: 'sms',
        });
      return await this.responseHandlerService.response(
        '',
        HttpStatus.OK,
        'otp sent',
        user.phoneNumber,
      );
    } catch (error) {
      return await this.responseHandlerService.response(
        error.message,
        HttpStatus.SERVICE_UNAVAILABLE,
        '',
        '',
      );
    }
  }

  async verifyOTP(userName: string, otp: string) {
    try {
      const user = await this.findOne(userName);
      const verifiedResponse = await this.twilioService.client.verify
        .services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks.create({
          to: user.phoneNumber,
          code: otp,
        });

      if (verifiedResponse.valid) {
        user.verifiedPhoneNumber = true;
        await this.userRepository.save(user);
      }

      return await this.responseHandlerService.response(
        '',
        HttpStatus.OK,
        'otp verfied',
        user.phoneNumber,
      );
    } catch (error) {
      return await this.responseHandlerService.response(
        'invalid otp',
        HttpStatus.BAD_REQUEST,
        '',
        '',
      );
    }
  }
}
