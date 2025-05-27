"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.enableCors({
        origin: process.env.CORS_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001'
        ],
        credentials: true,
    });
    app.setGlobalPrefix(process.env.API_PREFIX || 'api');
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 API endpoints available at: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map