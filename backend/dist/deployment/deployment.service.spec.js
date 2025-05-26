"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const deployment_service_1 = require("./deployment.service");
describe('DeploymentService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [deployment_service_1.DeploymentService],
        }).compile();
        service = module.get(deployment_service_1.DeploymentService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=deployment.service.spec.js.map