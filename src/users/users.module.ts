import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ResponseHandlerService } from 'src/utilities/response-handler.service';
import { Users } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalStrategy } from 'src/auth/local.strategy';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from 'src/utilities/joi-validation';
import { TwilioModule } from 'nestjs-twilio';
import { GoogleStrategy } from 'src/auth/google.strategy';
import { Verifications } from './entities/verification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Verifications]),
    ConfigModule.forRoot({
      envFilePath: '.env.stage.dev',
      validationSchema: envSchema,
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    ResponseHandlerService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
  ],
  exports: [UsersService],
})
export class UsersModule {}
