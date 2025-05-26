"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const donor_portal_controller_1 = require("./donor-portal.controller");
describe('DonorPortalController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [donor_portal_controller_1.DonorPortalController],
        }).compile();
        controller = module.get(donor_portal_controller_1.DonorPortalController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=donor-portal.controller.spec.js.map