"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const donor_portal_service_1 = require("./donor-portal.service");
describe('DonorPortalService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [donor_portal_service_1.DonorPortalService],
        }).compile();
        service = module.get(donor_portal_service_1.DonorPortalService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=donor-portal.service.spec.js.map