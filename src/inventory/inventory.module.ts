import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from 'src/inventory/entity/inventory.entity';
import { ResponseHandlerService } from 'src/utilities/response-handler.service';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { LocalStrategy } from 'src/auth/local.strategy';
import { UsersService } from 'src/users/users.service';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from 'src/utilities/joi-validation';
import { JwtModule } from '@nestjs/jwt';
import { TwilioModule } from 'nestjs-twilio';
import { Users } from 'src/users/entities/user.entity';
import { Verifications } from 'src/users/entities/verification.entity';
import { JWTExpiry } from 'src/users/entities/jwt-expiry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Verifications, Inventory, JWTExpiry]),
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
  providers: [
    UsersService,
    InventoryService,
    ResponseHandlerService,
    JwtStrategy,
    LocalStrategy,
  ],
  controllers: [InventoryController],
})
export class InventoryModule {}
