#!/bin/bash

echo "=== Test du module Zmanim complet ==="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ID du tenant siah
TENANT_ID="d0f351a8-fa3b-4206-ba6b-cb1f7a4bf695"
API_URL="http://localhost:3002/api"

echo "1. Test de l'API backend Zmanim"
echo "--------------------------------"

echo -n "   - API /today: "
if curl -s "$API_URL/tenant/$TENANT_ID/zmanim/today" | jq -e '.hanetzHaChama' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

echo -n "   - API /shabbat: "
if curl -s "$API_URL/tenant/$TENANT_ID/zmanim/shabbat" | jq -e '.candleLighting' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

echo -n "   - API /display: "
if curl -s "$API_URL/tenant/$TENANT_ID/zmanim/display" | jq -e '.zmanim' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

echo ""
echo "2. Affichage des horaires du jour"
echo "----------------------------------"
curl -s "$API_URL/tenant/$TENANT_ID/zmanim/today" | jq '{
  lever_du_soleil: .hanetzHaChama,
  fin_du_shema: .sofZmanShmaGRA,
  midi_solaire: .chatzot,
  coucher_du_soleil: .shkiatHaChama,
  sortie_des_etoiles: .tzeitHakochavim,
  shabbat: .isShabbat
}'

echo ""
echo "3. Test frontend"
echo "----------------"
echo -n "   - Page /sites/siah/zmanim: "
if curl -s -I "http://localhost:3003/sites/siah/zmanim" | grep -q "200 OK"; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
fi

echo ""
echo "=== Test terminé ==="#