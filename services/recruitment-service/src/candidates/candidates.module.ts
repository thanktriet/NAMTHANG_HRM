import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { PrismaService } from '../common/prisma.service';
import { MinioService } from '../common/minio.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL || 'nats://localhost:4222'],
        },
      },
    ]),
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService, PrismaService, MinioService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
