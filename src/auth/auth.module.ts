import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from 'src/utilities/joi-validation';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/user.entity';
import { ResponseHandlerService } from 'src/utilities/response-handler.service';
import { JWTExpiry } from 'src/users/entities/jwt-expiry.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot({
      envFilePath: '.env.stage.dev',
      validationSchema: envSchema,
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    TypeOrmModule.forFeature([Users, JWTExpiry]),
  ],
  providers: [
    ResponseHandlerService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
