import { Test, TestingModule } from '@nestjs/testing';
import { DonorPortalService } from './donor-portal.service';

describe('DonorPortalService', () => {
  let service: DonorPortalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DonorPortalService],
    }).compile();

    service = module.get<DonorPortalService>(DonorPortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
