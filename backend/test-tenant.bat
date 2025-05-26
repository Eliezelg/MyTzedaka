@echo off
set NODE_ENV=test
set DATABASE_URL=postgresql://postgres:Grenoble10@localhost:5432/platform_test
set JWT_SECRET=test-jwt-secret-key-for-testing-only-very-long-and-secure
set AWS_REGION=eu-west-1
set AWS_COGNITO_USER_POOL_ID=eu-west-1_TEST123456
set AWS_COGNITO_CLIENT_ID=test123456789abcdef123456789

echo Configuration des variables d'environnement de test...
echo DATABASE_URL=%DATABASE_URL%

echo Génération du client Prisma...
npx prisma generate

echo Application des migrations...
npx prisma migrate deploy

echo Lancement des tests d'isolation tenant...
npx jest --config ./test/jest-e2e.json --testPathPattern=tenant-isolation
