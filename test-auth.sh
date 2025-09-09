#!/bin/bash

echo "Testing Authentication System"
echo "=============================="
echo ""

# Test login with tenant
echo "Testing login with tenant (test-asso)..."
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-asso" \
  -d '{"email":"admin@test.com","password":"Test123456@"}' \
  -s | jq '.'

echo ""
echo "Testing login-hub (global)..."
curl -X POST http://localhost:3002/api/auth/login-hub \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Test123456@"}' \
  -s | jq '.'

echo ""
echo "Testing /api/auth/me endpoint with token..."
# First get a token
TOKEN=$(curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: test-asso" \
  -d '{"email":"admin@test.com","password":"Test123456@"}' \
  -s | jq -r '.tokens.accessToken')

if [ -n "$TOKEN" ]; then
  echo "Got token: ${TOKEN:0:20}..."
  curl -X GET http://localhost:3002/api/auth/me \
    -H "Authorization: Bearer $TOKEN" \
    -s | jq '.'
else
  echo "Failed to get token"
fi