import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { envSchema } from './utilities/joi-validation';
import { InventoryModule } from './inventory/inventory.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { customInputValidation } from './middleware/customValidation';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.stage.dev',
      validationSchema: envSchema,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.NODE_ENV,
      port: +process.env.DB_PORT,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        path.join(__dirname, '**', '**', '*.entity{.ts,.js}'),
        path.join(__dirname, '**', '**', '*.entities{.ts,.js}'),
      ],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: Number(process.env.TTL),
      limit: Number(process.env.LIMIT),
    }),
    InventoryModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(customInputValidation).forRoutes('*');
  }
}
