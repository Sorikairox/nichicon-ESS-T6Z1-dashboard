import { Module } from '@nestjs/common';
import { EcholiteService } from './echolite.service';
import { EcholiteController } from './echolite.controller';

@Module({
  providers: [EcholiteService],
  controllers: [EcholiteController]
})
export class EcholiteModule {}
