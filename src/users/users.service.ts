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
import { createTransport } from 'nodemailer';
import { Verifications } from './entities/verification.entity';
import * as sha256 from 'crypto-js/sha256';
import * as nodemailer from 'nodemailer';

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
    @InjectRepository(Verifications)
    private readonly verificationRepository: Repository<Verifications>,
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

  async googleLogin(req: any) {
    let user = await this.findOne(req.user.email);

    if (!user) {
      user = this.userRepository.create({
        userName: req.user.email,
        password: '',
        role: Role.USER,
        revokedTokens: '',
        verifiedPhoneNumber: false,
        phoneNumber: '',
      });

      await this.userRepository.save(user);
    }

    const payload = { userId: user.id, username: user.userName };
    const accessToken = { accessToken: this.jwtService.sign(payload) };
    return await this.responseHandlerService.response(
      '',
      HttpStatus.OK,
      'user loged in successfully',
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
      const { userName, phoneNumber } = updateUserDto;

      const updatedUser: Users = {
        ...user,
        ...(updateUserDto.userName && { userName: updateUserDto.userName }),
        ...(updateUserDto.phoneNumber && {
          phoneNumber: updateUserDto.phoneNumber,
        }),
      };
      if (phoneNumber) {
        updatedUser.verifiedPhoneNumber = false;
      }
      if (userName) {
        updatedUser.verifiedEmail = false;
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
      if (!user) {
        throw new Error('no user found');
      }
      if (user.verifiedPhoneNumber) {
        throw new Error('already verified');
      }
      if (!user.phoneNumber) {
        throw new Error('phone number does not exist');
      }

      const otpResponse = await this.twilioService.client.verify.v2
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
      if (!user) {
        throw new Error('no user found');
      }
      const verifiedResponse = await this.twilioService.client.verify.v2
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
        'phone number verfied',
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

  async sendLinkForEmail(userName: string) {
    try {
      const user = await this.findOne(userName);
      if (!user) {
        throw new Error('No user found');
      }

      const secret = process.env.VERIFICATION_SECRET;
      const hashDigest = sha256(user.userName + secret + Date.now());
      const verificationLink = `http://localhost:3000/users/verify-email?userName=${
        user.userName
      }&verification=${hashDigest.toString()}`;
      const transporter = createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASSWORD,
        },
      });

      const mailOptions = {
        from: 'vishnoishobhit201@gmail.com',
        to: user.userName,
        subject: 'Verify your email',
        text: 'Hey there, please click on the below link to verify your email ',
        html: `<p>Please click the following link to verify your email address:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
      };

      await transporter.sendMail(mailOptions);

      let verification = await this.verificationRepository.findOne({
        where: {
          userName: user.userName,
        },
      });

      if (!verification) {
        verification = this.verificationRepository.create({
          userName: user.userName,
          verificationHash: hashDigest.toString(),
          expirationTime: (Date.now() + 300).toString(),
        });
      } else {
        verification.verificationHash = hashDigest.toString();
        verification.expirationTime = (Date.now() + 300).toString();
      }

      await this.verificationRepository.save(verification);
      return await this.responseHandlerService.response(
        '',
        HttpStatus.OK,
        'email sent ',
        user.userName,
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

  async verifyEmail(userName: string, verificationHash: string) {
    try {
      const verifications = await this.verificationRepository.findOne({
        where: {
          userName,
        },
      });

      if (!verifications) {
        throw new Error('Incorrect details');
      }

      let todayDate = BigInt(Date.now().toString());

      if (BigInt(verifications.expirationTime) > todayDate) {
        throw new Error('verification hash has expired');
      }

      if (verifications.verificationHash == verificationHash) {
        const user = await this.findOne(userName);
        user.verifiedEmail = true;
        await this.userRepository.save(user);
      }

      return await this.responseHandlerService.response(
        '',
        HttpStatus.OK,
        'email verfied',
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

  async forgotPassword(userName: string) {
    try {
      const user = await this.findOne(userName);

      if (!user) {
        throw new Error('no user found');
      }
      if (!user.verifiedPhoneNumber) {
        throw new Error('phone number not verified');
      }
      if (!user.phoneNumber) {
        throw new Error('phone number does not exist');
      }

      const otpResponse = await this.twilioService.client.verify.v2
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

  async resetPassword(data: any) {
    try {
      if (!data.userName || !data.newPassword || !data.otp) {
        throw new Error('please provide all the detials');
      }
      const user = await this.findOne(data.userName);

      if (!user) {
        throw new Error('no user found');
      }
      const verifiedResponse = await this.twilioService.client.verify.v2
        .services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks.create({
          to: user.phoneNumber,
          code: data.otp,
        });

      if (verifiedResponse.valid) {
        user.password = await bcrypt.hash(
          data.newPassword,
          +process.env.SALT_ROUNDS,
        );
        await this.userRepository.save(user);
      }
      return await this.responseHandlerService.response(
        '',
        HttpStatus.OK,
        'password updated',
        data.userName,
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
}
