import { Test, TestingModule } from '@nestjs/testing';
import { TenantAdminController } from './tenant-admin.controller';

describe('TenantAdminController', () => {
  let controller: TenantAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantAdminController],
    }).compile();

    controller = module.get<TenantAdminController>(TenantAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
