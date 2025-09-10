import { Test, TestingModule } from '@nestjs/testing';
import { TenantAdminService } from './tenant-admin.service';

describe('TenantAdminService', () => {
  let service: TenantAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantAdminService],
    }).compile();

    service = module.get<TenantAdminService>(TenantAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
