import { Module } from '@nestjs/common';
import { EvolutionService } from '../services/evolution.service';
import { SocketModule } from './socket.module';
import { LoggerModule } from './logger.module';

@Module({
    imports: [
        SocketModule,
        LoggerModule
    ],
    providers: [EvolutionService],
    exports: [EvolutionService]
})
export class EvolutionModule {}
