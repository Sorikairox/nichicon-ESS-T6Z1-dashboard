import { Controller, Get, Sse, MessageEvent } from '@nestjs/common';
import { Observable, interval } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { EcholiteService } from './echolite.service';
import { SystemStatus } from './types';

@Controller('echolite')
export class EcholiteController {
  constructor(private readonly echoliteService: EcholiteService) {}

  @Get('status')
  async getStatus(): Promise<SystemStatus> {
    return this.echoliteService.getSystemStatus();
  }

  @Get('connection')
  getConnection(): { connected: boolean } {
    return { connected: this.echoliteService.isConnected() };
  }

  @Sse('status/stream')
  streamStatus(): Observable<MessageEvent> {
    // Emit system status every 30 seconds
    return interval(30000).pipe(
      switchMap(() => this.echoliteService.getSystemStatus()),
      map(
        (status: SystemStatus) =>
          ({
            data: status,
          }) as MessageEvent,
      ),
    );
  }
}
