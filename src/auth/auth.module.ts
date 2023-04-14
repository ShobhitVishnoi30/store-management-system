import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from 'src/utilities/joi-validation';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/user.entity';
import { ResponseHandlerService } from 'src/utilities/response-handler.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    ConfigModule.forRoot({
      envFilePath: '.env.stage.dev',
      validationSchema: envSchema,
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    PassportModule,
  ],
  providers: [UsersService, ResponseHandlerService],
})
export class AuthModule {}
