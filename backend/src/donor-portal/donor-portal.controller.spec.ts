import { Test, TestingModule } from '@nestjs/testing';
import { DonorPortalController } from './donor-portal.controller';

describe('DonorPortalController', () => {
  let controller: DonorPortalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonorPortalController],
    }).compile();

    controller = module.get<DonorPortalController>(DonorPortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
