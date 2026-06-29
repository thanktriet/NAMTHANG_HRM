import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CandidatesModule } from './candidates/candidates.module';
import { JobPostingsModule } from './job-postings/job-postings.module';
import { InterviewsModule } from './interviews/interviews.module';
import { EvaluationsModule } from './evaluations/evaluations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CandidatesModule,
    JobPostingsModule,
    InterviewsModule,
    EvaluationsModule,
  ],
})
export class AppModule {}
