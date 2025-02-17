import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from '../controllers/metrics.controller';
import { BusinessMetricsService } from '../services/business-metrics.service';
import { QueueItem } from '../entities/queue.entity';
import { RedisModule } from './redis.module';
import { LoggerModule } from './logger.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([QueueItem]),
        RedisModule,
        LoggerModule
    ],
    controllers: [MetricsController],
    providers: [BusinessMetricsService],
    exports: [BusinessMetricsService]
})
export class MetricsModule {}
