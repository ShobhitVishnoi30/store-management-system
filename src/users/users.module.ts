import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ResponseHandlerService } from 'src/utilities/response-handler.service';
import { Users } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from 'src/utilities/joi-validation';
import { TwilioModule } from 'nestjs-twilio';
import { Verifications } from './entities/verification.entity';
import { JWTExpiry } from './entities/jwt-expiry.entity';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    // AuthModule,
    TypeOrmModule.forFeature([Users, Verifications, JWTExpiry]),
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
  providers: [UsersService, ResponseHandlerService],
  exports: [UsersService],
})
export class UsersModule {}
