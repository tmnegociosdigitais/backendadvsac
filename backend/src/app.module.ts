import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './modules/redis.module';
import { LoggerModule } from './modules/logger.module';
import { AuthModule } from './modules/auth.module';
import { QueueModule } from './modules/queue.module';
import { EvolutionModule } from './modules/evolution.module';
import { MetricsModule } from './modules/metrics.module';
import { config } from './config/config';
import { TypeOrmConfigService } from './config/typeorm.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [config]
        }),
        TypeOrmModule.forRootAsync({
            useClass: TypeOrmConfigService
        }),
        RedisModule,
        LoggerModule,
        AuthModule,
        QueueModule,
        EvolutionModule,
        MetricsModule
    ]
})
export class AppModule {}
