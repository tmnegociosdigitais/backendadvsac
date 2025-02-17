import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueService } from '../services/queue.service';
import { RedisModule } from './redis.module';
import { SocketModule } from './socket.module';
import { LoggerModule } from './logger.module';
import { UserModule } from './user.module';
import { DepartmentModule } from './department.module';
import { QueueItem } from '../entities/queue.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([QueueItem]),
        RedisModule,
        SocketModule,
        LoggerModule,
        UserModule,
        DepartmentModule
    ],
    providers: [QueueService],
    exports: [QueueService]
})
export class QueueModule {}
