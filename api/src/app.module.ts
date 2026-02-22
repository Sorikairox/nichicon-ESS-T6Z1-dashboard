import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EcholiteModule } from './echolite/echolite.module';

@Module({
  imports: [EcholiteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
