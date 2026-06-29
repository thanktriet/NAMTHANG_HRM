import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { PrismaService } from '../common/prisma.service';

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
  controllers: [InterviewsController],
  providers: [InterviewsService, PrismaService],
  exports: [InterviewsService],
})
export class InterviewsModule {}
