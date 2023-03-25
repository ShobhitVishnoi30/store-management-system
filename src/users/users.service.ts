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
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService implements OnModuleInit {
  async onModuleInit() {
    let adminDetails = {
      userName: 'admin@login',
      password: process.env.ADMIN_PASSWORD,
      role: Role.ADMIN,
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

  async create(createUserDto: CreateUserDto) {
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

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        userName: loginUserDto.userName,
      },
    });

    if (user) {
      let correctPassword = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );
      if (correctPassword) {
        const { password, ...result } = user;

        const jwtToken = await this.login(user.userName);
        return await this.responseHandlerService.response(
          '',
          HttpStatus.OK,
          'user logged in successfully',
          jwtToken,
        );
      } else {
        return await this.responseHandlerService.response(
          'Incorrect password',
          HttpStatus.BAD_REQUEST,
          null,
          null,
        );
      }
    } else {
      return await this.responseHandlerService.response(
        `user ${loginUserDto.userName} does not exist`,
        HttpStatus.BAD_REQUEST,
        null,
        null,
      );
    }
  }

  async login(user: any) {
    const payload = { username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
