"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicHub = exports.PUBLIC_HUB_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PUBLIC_HUB_KEY = 'isPublicHub';
const PublicHub = () => (0, common_1.SetMetadata)(exports.PUBLIC_HUB_KEY, true);
exports.PublicHub = PublicHub;
//# sourceMappingURL=public-hub.decorator.js.map