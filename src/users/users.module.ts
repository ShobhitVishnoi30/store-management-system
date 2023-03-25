import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ResponseHandlerService } from 'src/utilities/response-handler.service';
import { Users } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/jwt-strategy';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from 'src/utilities/joi-validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.stage.dev',
      validationSchema: envSchema,
    }),
    TypeOrmModule.forFeature([Users]),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, ResponseHandlerService, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
