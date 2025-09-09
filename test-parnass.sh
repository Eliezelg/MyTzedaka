#!/bin/bash

echo "=== Test du module Parnass ==="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# ID du tenant siah
TENANT_ID="d0f351a8-fa3b-4206-ba6b-cb1f7a4bf695"
API_URL="http://localhost:3002/api"
TOKEN="YOUR_JWT_TOKEN" # À remplacer par un token valide

echo "1. Récupération des paramètres Parnass"
echo "---------------------------------------"
curl -s "$API_URL/admin/tenants/$TENANT_ID/parnass/settings" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo ""
echo "2. Récupération des sponsors actuels"
echo "-------------------------------------"
curl -s "$API_URL/tenant/$TENANT_ID/parnass/current" | jq '.'

echo ""
echo "3. Test de création d'un sponsor (simulation)"
echo "----------------------------------------------"
echo -e "${YELLOW}Exemple de création d'un sponsor quotidien:${NC}"
cat <<EOF
curl -X POST "$API_URL/admin/tenants/$TENANT_ID/parnass" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{
    "type": "DAILY",
    "sponsorDate": "$(date -I)",
    "sponsorName": "David Cohen",
    "sponsorMessage": "Pour la réussite de la communauté",
    "isAnonymous": false,
    "dedicationType": "FOR_SUCCESS",
    "dedicationName": "La famille Cohen",
    "amount": 100,
    "currency": "EUR"
  }'
EOF

echo ""
echo "4. Vérification des dates disponibles"
echo "--------------------------------------"
START_DATE=$(date -I)
END_DATE=$(date -d "+30 days" -I)
echo "Dates disponibles pour le sponsoring quotidien:"
curl -s "$API_URL/tenant/$TENANT_ID/parnass/available-dates?type=DAILY&startDate=$START_DATE&endDate=$END_DATE" | jq '.'

echo ""
echo "5. Test des statistiques Parnass"
echo "---------------------------------"
YEAR=$(date +%Y)
echo "Statistiques pour l'année $YEAR:"
curl -s "$API_URL/admin/tenants/$TENANT_ID/parnass/statistics?year=$YEAR" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo ""
echo -e "${GREEN}=== Tests terminés ===${NC}"
echo ""
echo "Pour tester l'interface admin:"
echo "1. Connectez-vous à http://localhost:3000/sites/siah/admin"
echo "2. Allez dans l'onglet 'Parnass'"
echo "3. Configurez les paramètres et créez des sponsors"
echo ""
echo "Pour voir l'affichage public:"
echo "1. Allez sur http://localhost:3000/sites/siah"
echo "2. Le widget Parnass devrait afficher les sponsors actuels"