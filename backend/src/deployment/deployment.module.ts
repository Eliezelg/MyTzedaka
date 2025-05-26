import { Module } from '@nestjs/common';
import { DeploymentService } from './deployment.service';

@Module({
  providers: [DeploymentService]
})
export class DeploymentModule {}
