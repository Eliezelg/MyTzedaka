#!/bin/bash

# Script pour obtenir un token d'authentification

echo "=== Obtention d'un token d'authentification ==="
echo ""

# Credentials par défaut
EMAIL=${1:-"admin@test.com"}
PASSWORD=${2:-"Test123456@"}
API_URL="http://localhost:3002/api"

echo "Connexion avec : $EMAIL"

# Login et récupération du token
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"tenantId\": \"d0f351a8-fa3b-4206-ba6b-cb1f7a4bf695\"
  }")

# Extraire les tokens
ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken // .access_token // .token // empty')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken // .refresh_token // empty')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Échec de la connexion"
  echo "Réponse : $RESPONSE"
  echo ""
  echo "Essai avec login-hub..."
  
  # Essayer avec login-hub
  RESPONSE=$(curl -s -X POST "$API_URL/auth/login-hub" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")
  
  ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken // .access_token // .token // empty')
  REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken // .refresh_token // empty')
fi

if [ -n "$ACCESS_TOKEN" ]; then
  echo "✅ Token obtenu avec succès"
  echo ""
  echo "ACCESS_TOKEN: $ACCESS_TOKEN"
  echo ""
  
  # Sauvegarder le token
  echo $ACCESS_TOKEN > ~/.mytzedaka_token
  
  # Vérifier l'utilisateur
  echo "Vérification du profil utilisateur :"
  curl -s "$API_URL/auth/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
  
  echo ""
  echo "Token sauvegardé dans ~/.mytzedaka_token"
  echo ""
  echo "Pour utiliser le token :"
  echo "export TOKEN=$ACCESS_TOKEN"
  echo ""
  echo "Ou dans les requêtes :"
  echo "curl -H \"Authorization: Bearer \$TOKEN\" ..."
else
  echo "❌ Impossible d'obtenir un token"
  echo "Réponse : $RESPONSE"
fi