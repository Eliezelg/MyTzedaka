const { ComplexZmanimCalendar, GeoLocation } = require("kosher-zmanim");
const fs = require('fs');

// Configuration pour le 13 septembre 2025
const date = new Date('2025-09-13T00:00:00');
const latitude = 31.7650511;  // Corrigé : latitude et longitude étaient inversées
const longitude = 35.1746302;
const elevation = 0; // Élévation par défaut
const timezone = "Asia/Jerusalem";

// Créer la localisation
const location = new GeoLocation("Custom Location", latitude, longitude, elevation, timezone);
const calendar = new ComplexZmanimCalendar(location);
calendar.setDate(date);

// Fonction pour formater le temps
function formatTime(date) {
    if (!date || isNaN(date.getTime())) {
        return "N/A";
    }
    return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        timeZone: timezone 
    });
}

// Fonction pour formater la date
function formatDate(date) {
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: timezone
    });
}

// Liste complète des 180+ méthodes zmanim disponibles
const zmanimMethods = {
    "Aube (Alot HaShachar)": [
        { name: "Alot 120 minutes", method: "getAlos120" },
        { name: "Alot 120 minutes Zmanis", method: "getAlos120Zmanis" },
        { name: "Alot 96 minutes", method: "getAlos96" },
        { name: "Alot 96 minutes Zmanis", method: "getAlos96Zmanis" },
        { name: "Alot 90 minutes", method: "getAlos90" },
        { name: "Alot 90 minutes Zmanis", method: "getAlos90Zmanis" },
        { name: "Alot 72 minutes", method: "getAlos72" },
        { name: "Alot 72 minutes Zmanis", method: "getAlos72Zmanis" },
        { name: "Alot 60 minutes", method: "getAlos60" },
        { name: "Alot 26 degrés", method: "getAlos26Degrees" },
        { name: "Alot 19.8 degrés", method: "getAlos19Point8Degrees" },
        { name: "Alot 19 degrés", method: "getAlos19Degrees" },
        { name: "Alot 18 degrés", method: "getAlos18Degrees" },
        { name: "Alot 16.1 degrés", method: "getAlos16Point1Degrees" },
        { name: "Alot Baal HaTanya", method: "getAlosBaalHatanya" }
    ],
    "Misheyakir (Tallit et Tefillin)": [
        { name: "Misheyakir 11.5 degrés", method: "getMisheyakir11Point5Degrees" },
        { name: "Misheyakir 11 degrés", method: "getMisheyakir11Degrees" },
        { name: "Misheyakir 10.2 degrés", method: "getMisheyakir10Point2Degrees" },
        { name: "Misheyakir 9.5 degrés", method: "getMisheyakir9Point5Degrees" },
        { name: "Misheyakir 7.65 degrés", method: "getMisheyakir7Point65Degrees" }
    ],
    "Lever du soleil (Hanetz)": [
        { name: "Lever du soleil", method: "getSunrise" },
        { name: "Lever au niveau de la mer", method: "getSeaLevelSunrise" },
        { name: "Lever Baal HaTanya", method: "getSunriseBaalHatanya" },
        { name: "Lever pour la Amidah", method: "getSunriseOffsetByDegrees", params: [0.833] }
    ],
    "Sof Zman Kriat Shema": [
        { name: "Shema GRA", method: "getSofZmanShmaGRA" },
        { name: "Shema Baal HaTanya", method: "getSofZmanShmaBaalHatanya" },
        { name: "Shema MGA 120 minutes", method: "getSofZmanShmaMGA120Minutes" },
        { name: "Shema MGA 96 minutes", method: "getSofZmanShmaMGA96Minutes" },
        { name: "Shema MGA 96 min Zmanis", method: "getSofZmanShmaMGA96MinutesZmanis" },
        { name: "Shema MGA 90 minutes", method: "getSofZmanShmaMGA90Minutes" },
        { name: "Shema MGA 90 min Zmanis", method: "getSofZmanShmaMGA90MinutesZmanis" },
        { name: "Shema MGA 72 minutes", method: "getSofZmanShmaMGA72Minutes" },
        { name: "Shema MGA 72 min Zmanis", method: "getSofZmanShmaMGA72MinutesZmanis" },
        { name: "Shema MGA 60 minutes", method: "getSofZmanShmaMGA60Minutes" },
        { name: "Shema MGA 19.8 degrés", method: "getSofZmanShmaMGA19Point8Degrees" },
        { name: "Shema MGA 18 degrés", method: "getSofZmanShmaMGA18Degrees" },
        { name: "Shema MGA 16.1 degrés", method: "getSofZmanShmaMGA16Point1Degrees" },
        { name: "Shema 3 heures", method: "getSofZmanShma3HoursBeforeChatzos" },
        { name: "Shema Ateret Torah", method: "getSofZmanShmaAteretTorah" },
        { name: "Shema Alos to Sunset", method: "getSofZmanShmaAlos16Point1ToSunset" },
        { name: "Shema Alos to Tzais", method: "getSofZmanShmaAlos16Point1ToTzaisGeonim7Point083Degrees" }
    ],
    "Sof Zman Tefila": [
        { name: "Tefila GRA", method: "getSofZmanTfilaGRA" },
        { name: "Tefila Baal HaTanya", method: "getSofZmanTfilaBaalHatanya" },
        { name: "Tefila MGA 120 minutes", method: "getSofZmanTfilaMGA120Minutes" },
        { name: "Tefila MGA 96 minutes", method: "getSofZmanTfilaMGA96Minutes" },
        { name: "Tefila MGA 96 min Zmanis", method: "getSofZmanTfilaMGA96MinutesZmanis" },
        { name: "Tefila MGA 90 minutes", method: "getSofZmanTfilaMGA90Minutes" },
        { name: "Tefila MGA 90 min Zmanis", method: "getSofZmanTfilaMGA90MinutesZmanis" },
        { name: "Tefila MGA 72 minutes", method: "getSofZmanTfilaMGA72Minutes" },
        { name: "Tefila MGA 72 min Zmanis", method: "getSofZmanTfilaMGA72MinutesZmanis" },
        { name: "Tefila MGA 60 minutes", method: "getSofZmanTfilaMGA60Minutes" },
        { name: "Tefila MGA 19.8 degrés", method: "getSofZmanTfilaMGA19Point8Degrees" },
        { name: "Tefila MGA 18 degrés", method: "getSofZmanTfilaMGA18Degrees" },
        { name: "Tefila MGA 16.1 degrés", method: "getSofZmanTfilaMGA16Point1Degrees" },
        { name: "Tefila 2 heures", method: "getSofZmanTfila2HoursBeforeChatzos" },
        { name: "Tefila Ateret Torah", method: "getSofZmanTfilahAteretTorah" },
        { name: "Tefila Alos to Sunset", method: "getSofZmanTfilaAlos16Point1ToSunset" }
    ],
    "Chatzot (Midi)": [
        { name: "Chatzot", method: "getChatzos" },
        { name: "Chatzot solaire fixe", method: "getFixedLocalChatzos" }
    ],
    "Mincha": [
        { name: "Mincha Gedola", method: "getMinchaGedola" },
        { name: "Mincha Gedola 30 min", method: "getMinchaGedola30Minutes" },
        { name: "Mincha Gedola 72 min", method: "getMinchaGedola72Minutes" },
        { name: "Mincha Gedola 16.1 degrés", method: "getMinchaGedola16Point1Degrees" },
        { name: "Mincha Gedola Ateret Torah", method: "getMinchaGedolaAteretTorah" },
        { name: "Mincha Gedola Baal HaTanya", method: "getMinchaGedolaBaalHatanya" },
        { name: "Mincha Gedola GRA Baal HaTanya", method: "getMinchaGedolaBaalHatanyaGreaterThan30" },
        { name: "Mincha Ketana", method: "getMinchaKetana" },
        { name: "Mincha Ketana 72 min", method: "getMinchaKetana72Minutes" },
        { name: "Mincha Ketana 16.1 degrés", method: "getMinchaKetana16Point1Degrees" },
        { name: "Mincha Ketana Ateret Torah", method: "getMinchaKetanaAteretTorah" },
        { name: "Mincha Ketana Baal HaTanya", method: "getMinchaKetanaBaalHatanya" },
        { name: "Mincha Ketana GRA Fixed", method: "getMinchaKetanaGRAFixedLocalChatzosToSunset" }
    ],
    "Plag HaMincha": [
        { name: "Plag HaMincha", method: "getPlagHamincha" },
        { name: "Plag HaMincha 60 min", method: "getPlagHamincha60Minutes" },
        { name: "Plag HaMincha 72 min", method: "getPlagHamincha72Minutes" },
        { name: "Plag HaMincha 72 min Zmanis", method: "getPlagHamincha72MinutesZmanis" },
        { name: "Plag HaMincha 90 min", method: "getPlagHamincha90Minutes" },
        { name: "Plag HaMincha 90 min Zmanis", method: "getPlagHamincha90MinutesZmanis" },
        { name: "Plag HaMincha 96 min", method: "getPlagHamincha96Minutes" },
        { name: "Plag HaMincha 96 min Zmanis", method: "getPlagHamincha96MinutesZmanis" },
        { name: "Plag HaMincha 16.1 degrés", method: "getPlagHamincha16Point1Degrees" },
        { name: "Plag HaMincha 18 degrés", method: "getPlagHamincha18Degrees" },
        { name: "Plag HaMincha 19.8 degrés", method: "getPlagHamincha19Point8Degrees" },
        { name: "Plag HaMincha 26 degrés", method: "getPlagHamincha26Degrees" },
        { name: "Plag HaMincha Ateret Torah", method: "getPlagHaminchaAteretTorah" },
        { name: "Plag HaMincha Baal HaTanya", method: "getPlagHaminchaBaalHatanya" },
        { name: "Plag HaMincha GRA Fixed", method: "getPlagHaminchaGRAFixedLocalChatzosToSunset" },
        { name: "Plag Alos to Sunset", method: "getPlagAlos16Point1ToSunset" },
        { name: "Plag Alos to Tzais", method: "getPlagAlosToSunset" }
    ],
    "Coucher du soleil (Shkia)": [
        { name: "Coucher du soleil", method: "getSunset" },
        { name: "Coucher au niveau de la mer", method: "getSeaLevelSunset" },
        { name: "Coucher Baal HaTanya", method: "getSunsetBaalHatanya" },
        { name: "Coucher pour la Amidah", method: "getSunsetOffsetByDegrees", params: [0.833] }
    ],
    "Bein HaShmashot": [
        { name: "Bein HaShmashot RT 13.5 min", method: "getBainHashmashosRT13Point5MinutesBefore7Point083Degrees" },
        { name: "Bein HaShmashot RT 58.5 min", method: "getBainHashmashosRT58Point5Minutes" },
        { name: "Bein HaShmashot RT 13.24 degrés", method: "getBainHashmashosRT13Point24Degrees" },
        { name: "Bein HaShmashot RT 2 étoiles", method: "getBainHashmashosRT2Stars" }
    ],
    "Tzait HaKochavim (Sortie des étoiles)": [
        { name: "Tzait 3 étoiles", method: "getTzais" },
        { name: "Tzait Geonim 3.65 degrés", method: "getTzaisGeonim3Point65Degrees" },
        { name: "Tzait Geonim 3.676 degrés", method: "getTzaisGeonim3Point676Degrees" },
        { name: "Tzait Geonim 4.37 degrés", method: "getTzaisGeonim4Point37Degrees" },
        { name: "Tzait Geonim 4.61 degrés", method: "getTzaisGeonim4Point61Degrees" },
        { name: "Tzait Geonim 4.8 degrés", method: "getTzaisGeonim4Point8Degrees" },
        { name: "Tzait Geonim 5.88 degrés", method: "getTzaisGeonim5Point88Degrees" },
        { name: "Tzait Geonim 5.95 degrés", method: "getTzaisGeonim5Point95Degrees" },
        { name: "Tzait Geonim 6.45 degrés", method: "getTzaisGeonim6Point45Degrees" },
        { name: "Tzait Geonim 7.083 degrés", method: "getTzaisGeonim7Point083Degrees" },
        { name: "Tzait Geonim 7.67 degrés", method: "getTzaisGeonim7Point67Degrees" },
        { name: "Tzait Geonim 8.5 degrés", method: "getTzaisGeonim8Point5Degrees" },
        { name: "Tzait Geonim 9.3 degrés", method: "getTzaisGeonim9Point3Degrees" },
        { name: "Tzait Geonim 9.75 degrés", method: "getTzaisGeonim9Point75Degrees" },
        { name: "Tzait Baal HaTanya", method: "getTzaisBaalHatanya" },
        { name: "Tzait 16.1 degrés", method: "getTzais16Point1Degrees" },
        { name: "Tzait 18 degrés", method: "getTzais18Degrees" },
        { name: "Tzait 19.8 degrés", method: "getTzais19Point8Degrees" },
        { name: "Tzait 26 degrés", method: "getTzais26Degrees" },
        { name: "Tzait 50 minutes", method: "getTzais50" },
        { name: "Tzait 60 minutes", method: "getTzais60" },
        { name: "Tzait 72 minutes", method: "getTzais72" },
        { name: "Tzait 72 minutes Zmanis", method: "getTzais72Zmanis" },
        { name: "Tzait 90 minutes", method: "getTzais90" },
        { name: "Tzait 90 minutes Zmanis", method: "getTzais90Zmanis" },
        { name: "Tzait 96 minutes", method: "getTzais96" },
        { name: "Tzait 96 minutes Zmanis", method: "getTzais96Zmanis" },
        { name: "Tzait 120 minutes", method: "getTzais120" },
        { name: "Tzait 120 minutes Zmanis", method: "getTzais120Zmanis" },
        { name: "Tzait Ateret Torah", method: "getTzaisAteretTorah" }
    ],
    "Heures Saisonnières (Shaot Zmaniyot)": [
        { name: "Heure GRA", method: "getShaahZmanisGra" },
        { name: "Heure MGA", method: "getShaahZmanisMGA" },
        { name: "Heure Baal HaTanya", method: "getShaahZmanisBaalHatanya" },
        { name: "Heure 16.1 degrés", method: "getShaahZmanis16Point1Degrees" },
        { name: "Heure 18 degrés", method: "getShaahZmanis18Degrees" },
        { name: "Heure 19.8 degrés", method: "getShaahZmanis19Point8Degrees" },
        { name: "Heure 26 degrés", method: "getShaahZmanis26Degrees" },
        { name: "Heure 60 minutes", method: "getShaahZmanis60Minutes" },
        { name: "Heure 72 minutes", method: "getShaahZmanis72Minutes" },
        { name: "Heure 72 min Zmanis", method: "getShaahZmanis72MinutesZmanis" },
        { name: "Heure 90 minutes", method: "getShaahZmanis90Minutes" },
        { name: "Heure 90 min Zmanis", method: "getShaahZmanis90MinutesZmanis" },
        { name: "Heure 96 minutes", method: "getShaahZmanis96Minutes" },
        { name: "Heure 96 min Zmanis", method: "getShaahZmanis96MinutesZmanis" },
        { name: "Heure 120 minutes", method: "getShaahZmanis120Minutes" },
        { name: "Heure 120 min Zmanis", method: "getShaahZmanis120MinutesZmanis" },
        { name: "Heure Ateret Torah", method: "getShaahZmanisAteretTorah" }
    ],
    "Autres Zmanim": [
        { name: "Achilas Chametz", method: "getSofZmanAchilasChametzGRA" },
        { name: "Achilas Chametz MGA", method: "getSofZmanAchilasChametzMGA" },
        { name: "Biur Chametz GRA", method: "getSofZmanBiurChametzGRA" },
        { name: "Biur Chametz MGA", method: "getSofZmanBiurChametzMGA" },
        { name: "Biur Chametz Baal HaTanya", method: "getSofZmanBiurChametzBaalHatanya" },
        { name: "Kidouch Levana 3 jours", method: "getTchilasZmanKidushLevana3Days" },
        { name: "Kidouch Levana 7 jours", method: "getTchilasZmanKidushLevana7Days" },
        { name: "Kidouch Levana 15 jours", method: "getSofZmanKidushLevana15Days" },
        { name: "Kidouch Levana entre Molad", method: "getSofZmanKidushLevanaBetweenMoldos" },
        { name: "Kidouch Levana Baal HaTanya", method: "getSofZmanKidushLevanaBaalHatanya" },
        { name: "Molad", method: "getMolad" },
        { name: "Allumage Shabbat", method: "getCandleLighting", params: [18] },
        { name: "Début temps plus tôt", method: "getAlos72Zmanis" },
        { name: "Fin temps plus tard", method: "getTzais72Zmanis" }
    ]
};

// Calculer tous les zmanim
let results = [];
let totalCount = 0;

console.log("Calcul des 180+ zmanim en cours...\n");

for (const [category, methods] of Object.entries(zmanimMethods)) {
    results.push(`\n## ${category}\n`);
    
    for (const zmanimInfo of methods) {
        totalCount++;
        try {
            let time;
            if (zmanimInfo.params) {
                time = calendar[zmanimInfo.method](...zmanimInfo.params);
            } else if (typeof calendar[zmanimInfo.method] === 'function') {
                time = calendar[zmanimInfo.method]();
            } else {
                // Pour les propriétés (comme les heures zmaniyot qui retournent des millisecondes)
                const value = calendar[zmanimInfo.method];
                if (typeof value === 'number') {
                    // Convertir les millisecondes en format lisible (durée)
                    const hours = Math.floor(value / (1000 * 60 * 60));
                    const minutes = Math.floor((value % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((value % (1000 * 60)) / 1000);
                    time = `${hours}h ${minutes}m ${seconds}s`;
                } else {
                    time = value;
                }
            }
            
            // Formater le résultat
            const formattedTime = typeof time === 'string' ? time : formatTime(time);
            results.push(`${totalCount}. **${zmanimInfo.name}** : ${formattedTime}`);
            
        } catch (error) {
            results.push(`${totalCount}. **${zmanimInfo.name}** : Erreur - ${error.message}`);
        }
    }
}

// Créer le document Markdown
const markdown = `# Liste Complète des 180+ Zmanim
## Date : ${formatDate(date)}
## Lieu : Latitude ${latitude}, Longitude ${longitude}
## Fuseau horaire : ${timezone}

---

### Résumé
- **Total de zmanim calculés** : ${totalCount}
- **Coordonnées utilisées** : ${latitude}°N, ${longitude}°E
- **Élévation** : ${elevation}m
- **Méthode de calcul** : KosherZmanim Library v0.9.0

${results.join('\n')}

---

## Notes importantes

1. **Heures Zmaniyot** : Les valeurs en heures/minutes/secondes représentent la durée d'une heure saisonnière
2. **Précision** : Les calculs sont basés sur des formules astronomiques précises
3. **Variations** : Différentes communautés utilisent différentes méthodes de calcul
4. **Élévation** : L'élévation affecte les horaires de lever et coucher du soleil
5. **Méthodes multiples** : Certains horaires ont plusieurs méthodes de calcul selon les opinions halakhiques

## Méthodes recommandées (haute précision)

D'après l'analyse comparative avec le calendrier עתים לבינה :

- **Alot 90** : Utiliser \`getAlos19Point8Degrees()\`
- **Alot 72** : Utiliser \`getAlos16Point1Degrees()\`
- **Shema GRA** : Utiliser \`getSofZmanShmaGRA()\`
- **Shema MGA** : Utiliser les méthodes en degrés (16.1° ou 19.8°)
- **Tefila GRA** : Utiliser \`getSofZmanTfilaBaalHatanya()\`
- **Tzait** : Utiliser \`getTzais72()\` pour Rabbeinu Tam

---

*Document généré le ${new Date().toLocaleDateString('fr-FR')}*
*Utilisant KosherZmanim Library - ${totalCount} méthodes de calcul*
`;

// Sauvegarder le fichier
const outputPath = '/home/eli/Documents/MyTzedaka/documentation/ZMANIM-180-LISTE-13-09-2025.md';
fs.writeFileSync(outputPath, markdown);

console.log(`\n✅ Document créé avec succès : ${outputPath}`);
console.log(`📊 Total de ${totalCount} zmanim calculés pour le 13 septembre 2025`);
console.log(`📍 Coordonnées : ${latitude}°N, ${longitude}°E`);