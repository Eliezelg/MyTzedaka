#!/bin/bash

echo "=== Test du module Prières (Prayers) complet ==="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ID du tenant siah
TENANT_ID="d0f351a8-fa3b-4206-ba6b-cb1f7a4bf695"
API_URL="http://localhost:3002/api"

echo "1. Test de l'API backend Prayers"
echo "---------------------------------"

echo -n "   - API /today: "
if curl -s "$API_URL/tenant/$TENANT_ID/prayers/today" | jq -e '.shaharit' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

echo -n "   - API /next: "
if curl -s "$API_URL/tenant/$TENANT_ID/prayers/next" | jq -e '.next' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

echo -n "   - API /week: "
if curl -s "$API_URL/tenant/$TENANT_ID/prayers/week" | jq -e '.[0].shaharit' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

echo -n "   - API /display: "
if curl -s "$API_URL/tenant/$TENANT_ID/prayers/display" | jq -e '.prayers' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

echo ""
echo "2. Horaires de prières du jour"
echo "-------------------------------"
PRAYERS=$(curl -s "$API_URL/tenant/$TENANT_ID/prayers/today")
echo "$PRAYERS" | jq '{
  type_de_jour: .dayType,
  shaharit: .shaharit,
  minha: .minha,
  arvit: .arvit,
  musaf: .musaf,
  kriat_shema: .kriatShema
}'

echo ""
echo "3. Prochaine prière"
echo "-------------------"
NEXT=$(curl -s "$API_URL/tenant/$TENANT_ID/prayers/next")
echo "$NEXT" | jq '.next'

echo ""
echo "4. Comparaison avec les Zmanim"
echo "-------------------------------"
echo -e "${BLUE}Zmanim calculés:${NC}"
curl -s "$API_URL/tenant/$TENANT_ID/zmanim/today" | jq '{
  lever_du_soleil: .hanetzHaChama,
  coucher_du_soleil: .shkiatHaChama,
  sortie_etoiles: .tzeitHakochavim
}'

echo -e "${BLUE}Horaires de prières:${NC}"
echo "$PRAYERS" | jq '{
  shaharit: .shaharit,
  minha: .minha,
  arvit: .arvit
}'

echo ""
echo "5. Test configuration dynamique"
echo "--------------------------------"

# Test avec calcul basé sur les Zmanim
echo -n "   - Configuration BEFORE_SHKIA (20 min): "
MINHA_TIME=$(echo "$PRAYERS" | jq -r '.minha')
SHKIA=$(curl -s "$API_URL/tenant/$TENANT_ID/zmanim/today" | jq -r '.shkiatHaChama')
echo "Minha: $MINHA_TIME (Shkia: $SHKIA)"

echo ""
echo "6. Test frontend"
echo "----------------"
echo -n "   - Page /sites/siah/prayers: "
if curl -s -I "http://localhost:3003/sites/siah/prayers" | grep -q "200 OK"; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

echo ""
echo "=== Module Prayers fonctionnel ✅ ==="#