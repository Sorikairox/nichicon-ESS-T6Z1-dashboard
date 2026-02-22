import { Test, TestingModule } from '@nestjs/testing';
import { EcholiteService } from './echolite.service';

describe('EcholiteService', () => {
  let service: EcholiteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EcholiteService],
    }).compile();

    service = module.get<EcholiteService>(EcholiteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
