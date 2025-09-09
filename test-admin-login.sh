#!/bin/bash

# Script de test pour se connecter en tant qu'admin

echo "🔐 Test de connexion Admin"
echo "========================="

# Connexion avec les credentials admin de test
echo "📝 Connexion avec admin@test.com..."

RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test123456@"
  }')

# Extraire le token
TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ ! -z "$TOKEN" ]; then
  echo "✅ Connexion réussie!"
  echo "📋 Token: ${TOKEN:0:50}..."
  
  # Tester l'accès au profil
  echo ""
  echo "👤 Récupération du profil..."
  PROFILE=$(curl -s http://localhost:3002/api/auth/me \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$PROFILE" | jq '{ email: .email, role: .role, tenantId: .tenantId }'
  
  echo ""
  echo "🔗 Pour accéder à l'admin avec ce token:"
  echo "1. Ouvrez les DevTools du navigateur (F12)"
  echo "2. Dans la Console, exécutez:"
  echo "   document.cookie = 'auth_token=$TOKEN; path=/'"
  echo "3. Rechargez la page admin: http://localhost:3001/t/test-asso/admin"
else
  echo "❌ Échec de la connexion"
  echo "$RESPONSE" | jq .
fi