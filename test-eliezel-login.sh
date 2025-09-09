#!/bin/bash

echo "🔍 Test de connexion pour eliezelg@gmail.com (admin de Siah)"
echo "========================================="
echo ""

echo "1. Recherche des tenants de l'utilisateur..."
curl -s -X POST http://localhost:3001/api/auth/find-user-tenants \
  -H "Content-Type: application/json" \
  -d '{"email":"eliezelg@gmail.com"}' | jq .

echo ""
echo "2. Tentative de connexion..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"eliezelg@gmail.com","password":"Siah123456@"}')

echo "$RESPONSE" | jq '{user: .user, tenant: .tenant, hasAccessToken: (if .access_token then true else false end)}'

echo ""
echo "3. Vérification du slug du tenant..."
TENANT_SLUG=$(echo "$RESPONSE" | jq -r '.tenant.slug // "Non trouvé"')
echo "Slug du tenant: $TENANT_SLUG"

if [ "$TENANT_SLUG" = "siah" ]; then
  echo "✅ Succès! L'utilisateur est bien connecté à Siah"
else
  echo "❌ Erreur: Le tenant n'est pas Siah"
fi