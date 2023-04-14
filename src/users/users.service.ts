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

@Injectable()
export class UsersService implements OnModuleInit {
  async onModuleInit() {
    let adminDetails = {
      userName: 'admin@login',
      password: process.env.ADMIN_PASSWORD,
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
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      if (createUserDto.role == Role.ADMIN) {
        throw new Error('Incorrect role');
      }

      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        +process.env.SALT_ROUNDS,
      );

      createUserDto.userName = createUserDto.userName.toLowerCase();

      let user = this.userRepository.create(createUserDto);

      user.revokedTokens = '';

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
    const user = this.findById(userData.userId);
    const { userName, password } = updateUserDto;

    const updatedUser = Object.assign(user, {
      userName,
      password: await bcrypt.hash(password, +process.env.SALT_ROUNDS),
    });

    await this.userRepository.save(updatedUser);
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
}
