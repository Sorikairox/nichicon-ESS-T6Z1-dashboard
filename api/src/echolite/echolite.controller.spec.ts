import { Test, TestingModule } from '@nestjs/testing';
import { EcholiteController } from './echolite.controller';

describe('EcholiteController', () => {
  let controller: EcholiteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EcholiteController],
    }).compile();

    controller = module.get<EcholiteController>(EcholiteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
