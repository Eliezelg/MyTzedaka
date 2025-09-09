#!/bin/bash

echo "=== Test des différents modes de calcul pour Shaharit ==="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# ID du tenant siah
TENANT_ID="d0f351a8-fa3b-4206-ba6b-cb1f7a4bf695"
API_URL="http://localhost:3002/api"

echo "1. Récupération des Zmanim de référence"
echo "----------------------------------------"
ZMANIM=$(curl -s "$API_URL/tenant/$TENANT_ID/zmanim/today")
echo "$ZMANIM" | jq '{
  hanetz_hachama: .hanetzHaChama,
  sof_zman_shema_GRA: .sofZmanShmaGRA,
  sof_zman_shema_MGA: .sofZmanShmaMGA
}'

NETZ=$(echo "$ZMANIM" | jq -r '.hanetzHaChama')
SHEMA_GRA=$(echo "$ZMANIM" | jq -r '.sofZmanShmaGRA')
SHEMA_MGA=$(echo "$ZMANIM" | jq -r '.sofZmanShmaMGA')

echo ""
echo "2. Test des différents modes de Shaharit"
echo "-----------------------------------------"

# Mode FIXED (par défaut)
echo -e "${BLUE}Mode FIXED (défaut):${NC}"
CURRENT=$(curl -s "$API_URL/tenant/$TENANT_ID/prayers/today" | jq -r '.shaharit')
echo "   Shaharit: $CURRENT (heure fixe configurée)"

echo ""
echo -e "${BLUE}Mode BEFORE_NETZ (30 min avant le lever):${NC}"
echo "   Netz: $NETZ"
echo "   Shaharit calculé: devrait être ~30 min avant"
echo "   (Pour Vatikin - commencer pour dire Shema au lever du soleil)"

echo ""
echo -e "${BLUE}Mode AFTER_NETZ (après le lever):${NC}"
echo "   Netz: $NETZ"
echo "   Shaharit calculé: peut être immédiatement après ou X minutes après"

echo ""
echo -e "${BLUE}Mode BEFORE_SHEMA_GRA (45 min avant fin Shema GRA):${NC}"
echo "   Sof Zman Shema GRA: $SHEMA_GRA"
echo "   Shaharit calculé: devrait être ~45 min avant"
echo "   (Pour finir la Amida avant la fin du temps du Shema)"

echo ""
echo -e "${BLUE}Mode BEFORE_SHEMA_MGA (45 min avant fin Shema MGA):${NC}"
echo "   Sof Zman Shema MGA: $SHEMA_MGA"
echo "   Shaharit calculé: devrait être ~45 min avant"
echo "   (Calcul plus strict selon le Magen Avraham)"

echo ""
echo "3. Exemple de configuration pour mise à jour"
echo "---------------------------------------------"
echo -e "${YELLOW}Pour configurer en mode BEFORE_NETZ (Vatikin):${NC}"
cat <<EOF
curl -X PUT "$API_URL/tenant/$TENANT_ID/prayers/settings" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "shaharitMode": "BEFORE_NETZ",
    "shaharitOffset": 30,
    "roundingMode": "FIVE_MIN"
  }'
EOF

echo ""
echo -e "${YELLOW}Pour configurer en mode BEFORE_SHEMA_GRA:${NC}"
cat <<EOF
curl -X PUT "$API_URL/tenant/$TENANT_ID/prayers/settings" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "shaharitMode": "BEFORE_SHEMA_GRA",
    "shaharitOffset": 45,
    "roundingMode": "TEN_MIN"
  }'
EOF

echo ""
echo "=== Configuration flexible pour tous les besoins ✅ ==="#